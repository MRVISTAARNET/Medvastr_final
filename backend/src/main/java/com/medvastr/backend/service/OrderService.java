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
    private final CartRepository cartRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;
    private final ProductVariantRepository variantRepo;
    private final PromoCodeService promoCodeService;
    private final CartService cartService;
    private final RazorpayService razorpayService;
    private final EmailService emailService;
    private final ShiprocketService shiprocketService;

    private User me() {
        return userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow();
    }

    private void assertOrderOwner(Order order) {
        if (!order.getUser().getId().equals(me().getId())) {
            throw new RuntimeException("You do not have access to this order");
        }
    }

    public OrderDTO createOrder(CreateOrderRequest r) {
        User u = me();

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

        BigDecimal ship = subtotal.compareTo(FREE_SHIP) >= 0 ? BigDecimal.ZERO : SHIP_COST;
        BigDecimal disc = BigDecimal.ZERO;

        if (r.getPromoCode() != null && !r.getPromoCode().isBlank()) {
            var promoResult = promoCodeService.validate(r.getPromoCode(), subtotal);
            if (promoResult.isValid() && promoResult.getDiscountAmount() != null) {
                disc = promoResult.getDiscountAmount();
                promoCodeService.incrementUsage(r.getPromoCode());
            }
        }

        BigDecimal total = subtotal.add(ship).subtract(disc);
        String orderNum = genNum();

        Order o = Order.builder()
                .orderNumber(orderNum)
                .user(u)
                .subtotal(subtotal)
                .discountAmount(disc)
                .shippingAmount(ship)
                .taxAmount(BigDecimal.ZERO)
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
                .build();

        if (o.getPaymentMethod() == Order.PaymentMethod.ONLINE) {
            try {
                String razorpayId = razorpayService.createOrder(total, orderNum);
                o.setRazorpayOrderId(razorpayId);
            } catch (Exception e) {
                log.error("Razorpay order creation failed", e);
                throw new RuntimeException("Payment service unavailable. Try COD.");
            }
        }

        Order saved = orderRepo.save(o);
        for (var item : orderItems) {
            item.setOrder(saved);
        }
        saved.setItems(orderItems);

        Order finalSaved = orderRepo.save(saved);
        cartService.clearCart();

        if (finalSaved.getPaymentMethod() == Order.PaymentMethod.COD) {
            finalSaved.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepo.save(finalSaved);
            decrementStock(finalSaved);
            preloadOrderRelations(finalSaved);
            emailService.sendOrderConfirmationEmail(finalSaved);
            emailService.sendAdminNotification(finalSaved);
            shiprocketService.createOrder(finalSaved);
        }

        log.info("Order {} created", finalSaved.getOrderNumber());
        return toDTO(finalSaved);
    }

    public OrderDTO verifyPayment(PaymentVerificationRequest r) {
        Order o = orderRepo.findByOrderNumber(r.getOrderNumber()).orElseThrow();
        assertOrderOwner(o);

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
            emailService.sendOrderConfirmationEmail(saved);
            emailService.sendAdminNotification(saved);
            shiprocketService.createOrder(saved);
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
        o.setStatus(Order.OrderStatus.CANCELLED);
        return toDTO(orderRepo.save(o));
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
        preloadOrderRelations(o);
        shiprocketService.createOrder(o);
        return toDTO(o);
    }

    public TrackingDTO track(String num) {
        Order o = orderRepo.findByOrderNumber(num).orElseThrow(() -> new RuntimeException("Not found: " + num));
        List<String> steps = Arrays.asList("PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY",
                "DELIVERED");
        Map<String, String> lbl = Map.of(
                "PENDING", "Order Placed",
                "CONFIRMED", "Confirmed",
                "PROCESSING", "Being Prepared",
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
            });
        }
        if (order.getUser() != null) {
            order.getUser().getEmail();
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
            return variantRepo
                    .findByProductIdAndSizeAndColorHex(product.getId(), itemReq.getSize(), itemReq.getColorHex())
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
                    v.setStockQuantity(Math.max(0, v.getStockQuantity() - item.getQuantity()));
                    variantRepo.save(v);
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
                        .imageUrl(i.getVariant() != null ? i.getVariant().getImageUrl() : null)
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getTotalPrice())
                        .build()).collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }
}
