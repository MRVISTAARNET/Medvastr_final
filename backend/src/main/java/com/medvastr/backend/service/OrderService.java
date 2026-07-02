package com.medvastr.backend.service;

import com.medvastr.backend.dto.CreateOrderRequest;
import com.medvastr.backend.dto.OrderDTO;
import com.medvastr.backend.dto.OrderItemDTO;
import com.medvastr.backend.dto.PaymentVerificationRequest;
import com.medvastr.backend.dto.TrackingDTO;
import com.medvastr.backend.dto.TrackingEvent;
import com.medvastr.backend.model.Cart;
import com.medvastr.backend.dto.CartItemRequest;
import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderItem;
import com.medvastr.backend.model.Product;
import com.medvastr.backend.model.ProductVariant;
import com.medvastr.backend.model.User;
import com.medvastr.backend.repository.CartRepository;
import com.medvastr.backend.repository.OrderRepository;
import com.medvastr.backend.repository.ProductRepository;
import com.medvastr.backend.repository.ProductVariantRepository;
import com.medvastr.backend.repository.UserRepository;
import com.medvastr.backend.repository.StoreSettingRepository;
import com.medvastr.backend.model.InventoryLog;
import com.medvastr.backend.repository.InventoryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrderService {
    private static final BigDecimal FREE_SHIP = BigDecimal.valueOf(999);
    private static final BigDecimal SHIP_COST = BigDecimal.valueOf(99);

    private final OrderRepository orderRepo;
    private final StoreSettingRepository settingsRepo;
    private final CartRepository cartRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;
    private final ProductVariantRepository variantRepo;
    private final PromoCodeService promoCodeService;
    private final CartService cartService;
    private final RazorpayService razorpayService;
    private final EmailService emailService;
    private final ShiprocketService shiprocketService;
    private final InventoryLogRepository inventoryLogRepo;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final WhatsAppService whatsAppService;

    private User me() {
        return userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow();
    }

    private void assertOrderOwner(Order order) {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                User caller = userRepo.findByEmail(auth.getName()).orElse(null);
                if (caller != null) {
                    if (caller.getRole() == User.Role.ADMIN) {
                        return; // Admins can see all orders
                    }
                    if (!order.getUser().getId().equals(caller.getId())) {
                        throw new RuntimeException("You do not have access to this order");
                    }
                }
            }
        } catch (Exception ignored) {
            // Allow guest tracking read-only access by unique order number
        }
    }

    public BigDecimal calculateShippingFee(BigDecimal subtotal) {
        String baseStr = settingsRepo.findById("SHIPPING_BASE_FEE").map(s -> s.getSettingValue()).orElse("99");
        String thresholdStr = settingsRepo.findById("SHIPPING_FREE_THRESHOLD").map(s -> s.getSettingValue()).orElse("999");
        String promoDateStr = settingsRepo.findById("SHIPPING_PROMO_FREE_UNTIL").map(s -> s.getSettingValue()).orElse("");

        BigDecimal ship = new BigDecimal(baseStr);
        if (subtotal.compareTo(new BigDecimal(thresholdStr)) >= 0) {
            ship = BigDecimal.ZERO;
        }

        if (promoDateStr != null && !promoDateStr.isBlank()) {
            try {
                LocalDateTime promoDate = LocalDateTime.parse(promoDateStr);
                if (LocalDateTime.now().isBefore(promoDate)) {
                    ship = BigDecimal.ZERO;
                }
            } catch (Exception ignored) {}
        }
        return ship;
    }

    public OrderDTO createOrder(CreateOrderRequest r) {
        User u = null;
        boolean isGuest = false;
        String generatedPassword = null;
        try {
            u = me();
        } catch (Exception e) {
            isGuest = true;
            if (r.getEmail() == null || r.getEmail().isBlank()) {
                throw new RuntimeException("Email is required for guest checkout");
            }
            u = userRepo.findByEmail(r.getEmail()).orElseGet(() -> {
                User newUser = User.builder()
                        .email(r.getEmail())
                        .firstName(r.getFirstName())
                        .lastName(r.getLastName())
                        .phone(r.getPhone())
                        .role(User.Role.CUSTOMER)
                        .password(java.util.UUID.randomUUID().toString())
                        .build();
                return userRepo.save(newUser);
            });
            generatedPassword = null;
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        if (r.getItems() != null && !r.getItems().isEmpty()) {
            for (var itemReq : r.getItems()) {
                orderItems.add(buildOrderItem(itemReq));
                subtotal = subtotal.add(orderItems.get(orderItems.size() - 1).getTotalPrice());
            }
        } else {
            Cart cart = cartRepo.findByUser(u).orElseThrow(() -> new RuntimeException("Cart is empty"));
            if (cart.getItems().isEmpty()) {
                throw new RuntimeException("Cart is empty");
            }

            subtotal = cart.getItems().stream()
                    .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            for (var ci : cart.getItems()) {
                orderItems.add(OrderItem.builder()
                        .product(ci.getProduct())
                        .productName(ci.getProduct().getName())
                        .size(ci.getSize())
                        .colorName(ci.getColorName())
                        .colorHex(ci.getColorHex())
                        .quantity(ci.getQuantity())
                        .unitPrice(ci.getUnitPrice())
                        .totalPrice(ci.getUnitPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                        .build());
            }
        }

        BigDecimal ship = calculateShippingFee(subtotal);
        
        BigDecimal disc = BigDecimal.ZERO;

        if (r.getPromoCode() != null && !r.getPromoCode().isBlank()) {
            var promoResult = promoCodeService.validate(r.getPromoCode(), subtotal);
            if (promoResult.isValid() && promoResult.getDiscountAmount() != null) {
                disc = promoResult.getDiscountAmount();
                promoCodeService.incrementUsage(r.getPromoCode());
            }
        }

        BigDecimal total = subtotal.add(ship).subtract(disc);
        String tempNum = "TEMP-" + java.util.UUID.randomUUID().toString();

        BigDecimal taxVal = BigDecimal.ZERO;
        for (var oi : orderItems) {
            BigDecimal itemPrice = oi.getTotalPrice();
            if (disc.compareTo(BigDecimal.ZERO) > 0 && subtotal.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal proportion = itemPrice.divide(subtotal, 4, java.math.RoundingMode.HALF_UP);
                itemPrice = itemPrice.subtract(disc.multiply(proportion));
            }
            BigDecimal itemTaxPercent = oi.getProduct() != null && oi.getProduct().getTax() != null 
                    ? oi.getProduct().getTax() 
                    : new BigDecimal("5.0");
            
            BigDecimal itemTax = itemPrice.multiply(itemTaxPercent)
                    .divide(new BigDecimal("100").add(itemTaxPercent), 2, java.math.RoundingMode.HALF_UP);
            taxVal = taxVal.add(itemTax);
        }

        Order o = Order.builder()
                .orderNumber(tempNum)
                .user(u)
                .subtotal(subtotal)
                .discountAmount(disc)
                .shippingAmount(ship)
                .taxAmount(taxVal)
                .totalAmount(total)
                .promoCode(r.getPromoCode())
                .paymentMethod(r.getPaymentMethod() != null ? Order.PaymentMethod.valueOf(r.getPaymentMethod())
                        : Order.PaymentMethod.COD)
                .notes(r.getNotes())
                .shippingName(r.getFirstName() + " " + r.getLastName())
                .shippingPhone(r.getPhone())
                .shippingAddress(r.getAddress())
                .shippingCity(r.getCity())
                .shippingState(r.getState())
                .shippingPincode(r.getPincode())
                .paymentStatus(Order.PaymentStatus.PENDING)
                .status(Order.OrderStatus.PENDING)
                .tempPassword(generatedPassword)
                .build();

        Order saved = orderRepo.save(o);
        String orderNum = "MVS-" + LocalDateTime.now().getYear() + "-" + String.format("%06d", saved.getId());
        saved.setOrderNumber(orderNum);

        if (saved.getPaymentMethod() == Order.PaymentMethod.ONLINE) {
            try {
                String razorpayId = razorpayService.createOrder(total, orderNum);
                saved.setRazorpayOrderId(razorpayId);
            } catch (Exception e) {
                log.error("Razorpay order creation failed", e);
                throw new RuntimeException("Payment service unavailable. Try COD.");
            }
        }

        saved = orderRepo.save(saved);
        for (var item : orderItems) {
            item.setOrder(saved);
        }
        saved.setItems(orderItems);

        Order finalSaved = orderRepo.save(saved);
        if (!isGuest) {
            try {
                cartService.clearCart();
            } catch (Exception e) {
                log.error("Failed to clear cart for logged-in user", e);
            }
        }

        if (finalSaved.getPaymentMethod() == Order.PaymentMethod.COD) {
            finalSaved.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepo.save(finalSaved);
            decrementStock(finalSaved);
            preloadOrderRelations(finalSaved);
            triggerAsyncPostCommitActions(finalSaved);
        }

        log.info("Order {} created", finalSaved.getOrderNumber());
        return toDTO(finalSaved);
    }

    public OrderDTO verifyPayment(PaymentVerificationRequest r) {
        Order o = orderRepo.findByOrderNumber(r.getOrderNumber()).orElseThrow();
        try {
            assertOrderOwner(o);
        } catch (Exception e) {
            log.info("Guest checkout verification for order {}", o.getOrderNumber());
        }

        if (o.getPaymentStatus() == Order.PaymentStatus.PAID) {
            log.info("Payment already verified for order {}", o.getOrderNumber());
            return toDTO(o);
        }

        if (!r.getRazorpayOrderId().equals(o.getRazorpayOrderId())) {
            throw new RuntimeException("Payment order mismatch");
        }

        boolean valid = razorpayService.verifySignature(
                r.getRazorpayOrderId(), r.getRazorpayPaymentId(), r.getRazorpaySignature());

        if (valid) {
            o.setPaymentStatus(Order.PaymentStatus.PAID);
            o.setStatus(Order.OrderStatus.CONFIRMED);
            o.setPaymentId(r.getRazorpayPaymentId());
            Order saved = orderRepo.save(o);
            decrementStock(saved);
            preloadOrderRelations(saved);
            triggerAsyncPostCommitActions(saved);
            return toDTO(saved);
        }

        o.setPaymentStatus(Order.PaymentStatus.FAILED);
        log.error("Payment verification failed for order: {}", o.getOrderNumber());
        return toDTO(orderRepo.save(o));
    }

    public Page<OrderDTO> getMyOrders(Pageable p) {
        return orderRepo.findByUserIdOrderByCreatedAtDesc(me().getId(), p).map(this::toDTO);
    }

    public OrderDTO getByNum(String num) {
        Order o = orderRepo.findByOrderNumber(num).orElseThrow(() -> new RuntimeException("Not found: " + num));
        assertOrderOwner(o);
        return toDTO(o);
    }

    public OrderDTO cancel(String num) {
        Order o = orderRepo.findByOrderNumber(num).orElseThrow();
        assertOrderOwner(o);
        if (o.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel delivered order");
        }
        if (o.getStatus() == Order.OrderStatus.CANCELLED) {
            return toDTO(o);
        }
        o.setStatus(Order.OrderStatus.CANCELLED);
        Order saved = orderRepo.save(o);
        restoreStock(saved);
        return toDTO(saved);
    }

    public Page<OrderDTO> getAll(String status, Pageable p) {
        return status != null && !status.isBlank()
                ? orderRepo.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.valueOf(status), p).map(this::toDTO)
                : orderRepo.findAllByOrderByCreatedAtDesc(p).map(this::toDTO);
    }

    public OrderDTO updateStatus(Long id, String status) {
        Order o = orderRepo.findById(id).orElseThrow();
        o.setStatus(Order.OrderStatus.valueOf(status));
        if ("DELIVERED".equals(status)) {
            o.setDeliveredAt(LocalDateTime.now());
        }
        return toDTO(orderRepo.save(o));
    }

    @Transactional
    public OrderDTO pushToShiprocket(Long id) {
        Order o = orderRepo.findById(id).orElseThrow();
        pushToShiprocketAfterCommit(o.getId());
        return toDTO(o);
    }

    @Transactional
    public String pushToShiprocketSync(Long id) {
        return shiprocketService.createOrderSync(id);
    }

    public TrackingDTO track(String num) {
        Order o = orderRepo.findByOrderNumber(num).orElseThrow(() -> new RuntimeException("Not found: " + num));
        assertOrderOwner(o);
        List<String> steps = Arrays.asList("PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY",
                "DELIVERED");
        Map<String, String> lbl = Map.of(
                "PENDING", "Order Placed",
                "CONFIRMED", "Confirmed",
                "PROCESSING", "Processing",
                "PACKED", "Packed",
                "SHIPPED", "Shipped",
                "OUT_FOR_DELIVERY", "Out for Delivery",
                "DELIVERED", "Delivered");

        int cur = steps.indexOf(o.getStatus().name());
        List<TrackingEvent> tl = new ArrayList<>();
        for (int i = 0; i < steps.size(); i++) {
            tl.add(TrackingEvent.builder()
                    .status(steps.get(i))
                    .description(lbl.getOrDefault(steps.get(i), ""))
                    .completed(i <= cur)
                    .timestamp(i <= cur ? o.getCreatedAt().plusHours((long) i * 12) : null)
                    .build());
        }

        return TrackingDTO.builder()
                .orderNumber(num)
                .status(o.getStatus().name())
                .trackingNumber(o.getTrackingNumber())
                .courierName(o.getCourierName())
                .timeline(tl)
                .build();
    }

    private void preloadOrderRelations(Order order) {
        if (order.getItems() != null) {
            order.getItems().forEach(i -> {
                if (i.getProduct() != null) {
                    i.getProduct().getName();
                }
                if (i.getVariant() != null) {
                    i.getVariant().getSku();
                }
            });
        }
        if (order.getUser() != null) {
            order.getUser().getEmail();
        }
    }

    private void triggerAsyncPostCommitActions(Order order) {
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            emailService.sendOrderConfirmationEmail(order);
                        } catch (Exception e) {
                            log.error("Failed to send order confirmation email", e);
                        }
                        try {
                            emailService.sendAdminNotification(order);
                        } catch (Exception e) {
                            log.error("Failed to send admin notification email", e);
                        }
                        try {
                            whatsAppService.sendOrderAlerts(order);
                        } catch (Exception e) {
                            log.error("Failed to send WhatsApp order alerts", e);
                        }
                        try {
                            shiprocketService.createOrder(order.getId());
                        } catch (Exception e) {
                            log.error("Failed to push order to Shiprocket", e);
                        }
                    }
                }
            );
        } else {
            try {
                emailService.sendOrderConfirmationEmail(order);
            } catch (Exception e) {
                log.error("Failed to send order confirmation email", e);
            }
            try {
                emailService.sendAdminNotification(order);
            } catch (Exception e) {
                log.error("Failed to send admin notification email", e);
            }
            try {
                whatsAppService.sendOrderAlerts(order);
            } catch (Exception e) {
                log.error("Failed to send WhatsApp order alerts", e);
            }
            try {
                shiprocketService.createOrder(order.getId());
            } catch (Exception e) {
                log.error("Failed to push order to Shiprocket", e);
            }
        }
    }

    private void pushToShiprocketAfterCommit(Long orderId) {
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        shiprocketService.createOrder(orderId);
                    }
                }
            );
        } else {
            shiprocketService.createOrder(orderId);
        }
    }

    private OrderItem buildOrderItem(CartItemRequest itemReq) {
        Product product = productRepo.findById(itemReq.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));
        ProductVariant variant = resolveVariant(product, itemReq);
        if (variant != null) {
            if (!variant.getActive()) {
                throw new RuntimeException("Variant unavailable for " + product.getName());
            }
            if (variant.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for " + product.getName() + " (" + variant.getSize() + ")");
            }
        }
        BigDecimal unitPrice = variant != null && variant.getVariantPrice() != null
                ? variant.getVariantPrice()
                : product.getPrice();
        BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
        return OrderItem.builder()
                .product(product)
                .variant(variant)
                .productName(product.getName())
                .size(itemReq.getSize())
                .colorName(itemReq.getColorName())
                .colorHex(itemReq.getColorHex())
                .quantity(itemReq.getQuantity())
                .unitPrice(unitPrice)
                .totalPrice(itemTotal)
                .build();
    }

    private ProductVariant resolveVariant(Product product, CartItemRequest itemReq) {
        if (itemReq.getVariantId() != null) {
            return variantRepo.findByIdAndProductId(itemReq.getVariantId(), product.getId()).orElse(null);
        }
        if (itemReq.getSize() != null && itemReq.getColorHex() != null) {
            String lookupSize = itemReq.getSize();
            if (lookupSize.startsWith("Top: ")) {
                String[] parts = lookupSize.split("/");
                if (parts.length > 0) {
                    lookupSize = parts[0].replace("Top:", "").trim();
                }
            }
            return variantRepo
                    .findByProductIdAndSizeAndColorHex(product.getId(), lookupSize, itemReq.getColorHex())
                    .orElse(null);
        }
        return null;
    }

    private void decrementStock(Order order) {
        if (order.getItems() == null)
            return;
        for (OrderItem item : order.getItems()) {
            if (item.getVariant() != null) {
                ProductVariant v = variantRepo.findById(item.getVariant().getId()).orElse(null);
                if (v != null) {
                    int prevStock = v.getStockQuantity();
                    int qty = item.getQuantity();
                    int newStock = Math.max(0, prevStock - qty);
                    v.setStockQuantity(newStock);
                    variantRepo.save(v);

                    InventoryLog logEntry = InventoryLog.builder()
                            .variant(v)
                            .changeQuantity(-qty)
                            .previousStock(prevStock)
                            .newStock(newStock)
                            .actionType("PURCHASE")
                            .notes("Stock deducted for purchase order: " + order.getOrderNumber())
                            .build();
                    inventoryLogRepo.save(logEntry);
                }
            }
        }
    }

    private void restoreStock(Order order) {
        if (order.getItems() == null)
            return;
        for (OrderItem item : order.getItems()) {
            if (item.getVariant() != null) {
                ProductVariant v = variantRepo.findById(item.getVariant().getId()).orElse(null);
                if (v != null) {
                    int prevStock = v.getStockQuantity();
                    int qty = item.getQuantity();
                    int newStock = prevStock + qty;
                    v.setStockQuantity(newStock);
                    variantRepo.save(v);

                    InventoryLog logEntry = InventoryLog.builder()
                            .variant(v)
                            .changeQuantity(qty)
                            .previousStock(prevStock)
                            .newStock(newStock)
                            .actionType("ORDER_CANCELLED")
                            .notes("Stock restored on order cancellation: " + order.getOrderNumber())
                            .build();
                    inventoryLogRepo.save(logEntry);
                }
            }
        }
    }

    private String genNum() {
        return "MVS-" + LocalDateTime.now().getYear() + "-" + String.format("%06d", orderRepo.count() + 1);
    }

    private OrderDTO toDTO(Order o) {
        return OrderDTO.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus().name())
                .paymentMethod(o.getPaymentMethod().name())
                .paymentStatus(o.getPaymentStatus().name())
                .subtotal(o.getSubtotal())
                .discountAmount(o.getDiscountAmount())
                .shippingAmount(o.getShippingAmount())
                .totalAmount(o.getTotalAmount())
                .promoCode(o.getPromoCode())
                .shippingName(o.getShippingName())
                .shippingAddress(o.getShippingAddress())
                .shippingCity(o.getShippingCity())
                .shippingState(o.getShippingState())
                .shippingPincode(o.getShippingPincode())
                .shippingPhone(o.getShippingPhone())
                .trackingNumber(o.getTrackingNumber())
                .courierName(o.getCourierName())
                .createdAt(o.getCreatedAt())
                .deliveredAt(o.getDeliveredAt())
                .razorpayOrderId(o.getRazorpayOrderId())
                .items(o.getItems() != null ? o.getItems().stream().map(i -> OrderItemDTO.builder()
                        .id(i.getId())
                        .productName(i.getProductName())
                        .size(i.getSize())
                        .colorName(i.getColorName())
                        .colorHex(i.getColorHex())
                        .imageUrl(i.getVariant() != null && i.getVariant().getImageUrl() != null
                                ? i.getVariant().getImageUrl()
                                : (i.getProduct() != null && !i.getProduct().getImages().isEmpty()
                                        ? i.getProduct().getImages().iterator().next().getImageUrl()
                                        : null))
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getTotalPrice())
                        .build()).collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }
}
