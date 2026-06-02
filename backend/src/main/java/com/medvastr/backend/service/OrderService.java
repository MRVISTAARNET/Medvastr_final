package com.medvastr.backend.service;

import com.medvastr.backend.dto.CreateOrderRequest;
import com.medvastr.backend.dto.OrderDTO;
import com.medvastr.backend.dto.OrderItemDTO;
import com.medvastr.backend.dto.TrackingDTO;
import com.medvastr.backend.dto.TrackingEvent;
import com.medvastr.backend.model.Cart;
import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderItem;
import com.medvastr.backend.model.PromoCode;
import com.medvastr.backend.model.User;
import com.medvastr.backend.repository.CartRepository;
import com.medvastr.backend.repository.OrderRepository;
import com.medvastr.backend.repository.ProductRepository;
import com.medvastr.backend.repository.PromoCodeRepository;
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
    private final PromoCodeRepository promoRepo;
    private final CartService cartService;
    private final RazorpayService razorpayService;
    private final EmailService emailService;
    private final ShiprocketService shiprocketService;

    private User me() {
        return userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow();
    }

    public OrderDTO createOrder(CreateOrderRequest r) {
        User u = me();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        if (r.getItems() != null && !r.getItems().isEmpty()) {
            // Use items from request (Frontend Cart)
            for (var itemReq : r.getItems()) {
                var product = productRepo.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));

                BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                subtotal = subtotal.add(itemTotal);

                orderItems.add(OrderItem.builder()
                        .product(product)
                        .productName(product.getName())
                        .size(itemReq.getSize())
                        .colorName(itemReq.getColorName())
                        .colorHex(itemReq.getColorHex())
                        .quantity(itemReq.getQuantity())
                        .unitPrice(product.getPrice())
                        .totalPrice(itemTotal)
                        .build());
            }
        } else {
            // Fallback to database cart
            Cart cart = cartRepo.findByUser(u).orElseThrow(() -> new RuntimeException("Cart is empty"));
            if (cart.getItems().isEmpty())
                throw new RuntimeException("Cart is empty");

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
            var pc = promoRepo.findByCodeIgnoreCaseAndActiveTrue(r.getPromoCode());
            if (pc.isPresent()) {
                var p = pc.get();
                disc = p.getDiscountType() == PromoCode.DiscountType.PERCENTAGE
                        ? subtotal.multiply(p.getDiscountValue()).divide(BigDecimal.valueOf(100))
                        : p.getDiscountValue();
                p.setUsedCount(p.getUsedCount() + 1);
                promoRepo.save(p);
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

        log.info("[OrderService] Persisting order {} with paymentMethod: {} (length: {})",
                o.getOrderNumber(), o.getPaymentMethod(), o.getPaymentMethod().name().length());

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

            // Force load lazy fields for @Async services
            finalSaved.getItems().forEach(i -> {
                if (i.getProduct() != null)
                    i.getProduct().getName();
            });
            finalSaved.getUser().getEmail();

            emailService.sendOrderConfirmationEmail(finalSaved);
            shiprocketService.createOrder(finalSaved);
        }

        log.info("Order: {} created via direct items: {}", finalSaved.getOrderNumber(), r.getItems() != null);
        return toDTO(finalSaved);
    }

    public OrderDTO verifyPayment(com.medvastr.backend.dto.PaymentVerificationRequest r) {
        Order o = orderRepo.findByOrderNumber(r.getOrderNumber()).orElseThrow();
        boolean valid = razorpayService.verifySignature(r.getRazorpayOrderId(), r.getRazorpayPaymentId(),
                r.getRazorpaySignature());

        if (valid) {
            o.setPaymentStatus(Order.PaymentStatus.PAID);
            o.setStatus(Order.OrderStatus.CONFIRMED);
            o.setPaymentId(r.getRazorpayPaymentId());
            Order saved = orderRepo.save(o);

            // Force load lazy fields
            saved.getItems().forEach(i -> {
                if (i.getProduct() != null)
                    i.getProduct().getName();
            });
            saved.getUser().getEmail();

            emailService.sendOrderConfirmationEmail(saved);
            shiprocketService.createOrder(saved);
            return toDTO(saved);
        } else {
            o.setPaymentStatus(Order.PaymentStatus.FAILED);
            log.error("Payment verification failed for order: {}", o.getOrderNumber());
            return toDTO(orderRepo.save(o));
        }
    }

    public Page<OrderDTO> getMyOrders(Pageable p) {
        return orderRepo.findByUserIdOrderByCreatedAtDesc(me().getId(), p).map(this::toDTO);
    }

    public OrderDTO getByNum(String num) {
        return toDTO(orderRepo.findByOrderNumber(num).orElseThrow(() -> new RuntimeException("Not found: " + num)));
    }

    public OrderDTO cancel(String num) {
        Order o = orderRepo.findByOrderNumber(num).orElseThrow();
        if (o.getStatus() == Order.OrderStatus.DELIVERED)
            throw new RuntimeException("Cannot cancel delivered order");
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
        if ("DELIVERED".equals(status))
            o.setDeliveredAt(LocalDateTime.now());
        return toDTO(orderRepo.save(o));
    }

    @Transactional
    public OrderDTO pushToShiprocket(Long id) {
        Order o = orderRepo.findById(id).orElseThrow();
        o.getItems().forEach(i -> {
            if (i.getProduct() != null) {
                i.getProduct().getName();
            }
        });
        o.getUser().getEmail();
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
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getTotalPrice())
                        .build()).collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }
}
