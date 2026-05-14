package com.medvastr.service;

import com.medvastr.dto.CreateOrderRequest;
import com.medvastr.dto.OrderDTO;
import com.medvastr.dto.OrderItemDTO;
import com.medvastr.dto.TrackingDTO;
import com.medvastr.dto.TrackingEvent;
import com.medvastr.model.Cart;
import com.medvastr.model.Order;
import com.medvastr.model.OrderItem;
import com.medvastr.model.PromoCode;
import com.medvastr.model.User;
import com.medvastr.repository.CartRepository;
import com.medvastr.repository.OrderRepository;
import com.medvastr.repository.PromoCodeRepository;
import com.medvastr.repository.UserRepository;
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
    private final PromoCodeRepository promoRepo;
    private final CartService cartService;

    private User me() {
        return userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow();
    }

    public OrderDTO createOrder(CreateOrderRequest r) {
        User u = me();
        Cart cart = cartRepo.findByUser(u).orElseThrow(() -> new RuntimeException("Cart is empty"));
        if (cart.getItems().isEmpty()) throw new RuntimeException("Cart is empty");

        BigDecimal sub = cart.getItems().stream()
            .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal ship = sub.compareTo(FREE_SHIP) >= 0 ? BigDecimal.ZERO : SHIP_COST;
        BigDecimal disc = BigDecimal.ZERO;

        if (r.getPromoCode() != null && !r.getPromoCode().isBlank()) {
            var pc = promoRepo.findByCodeIgnoreCaseAndActiveTrue(r.getPromoCode());
            if (pc.isPresent()) {
                var p = pc.get();
                disc = p.getDiscountType() == PromoCode.DiscountType.PERCENTAGE
                    ? sub.multiply(p.getDiscountValue()).divide(BigDecimal.valueOf(100))
                    : p.getDiscountValue();
                p.setUsedCount(p.getUsedCount() + 1);
                promoRepo.save(p);
            }
        }

        Order o = Order.builder()
            .orderNumber(genNum())
            .user(u)
            .subtotal(sub)
            .discountAmount(disc)
            .shippingAmount(ship)
            .taxAmount(BigDecimal.ZERO)
            .totalAmount(sub.add(ship).subtract(disc))
            .promoCode(r.getPromoCode())
            .paymentMethod(r.getPaymentMethod() != null ? Order.PaymentMethod.valueOf(r.getPaymentMethod()) : Order.PaymentMethod.COD)
            .notes(r.getNotes())
            .build();

        Order saved = orderRepo.save(o);
        saved.setItems(
            cart.getItems().stream()
                .map(ci -> OrderItem.builder()
                    .order(saved)
                    .product(ci.getProduct())
                    .productName(ci.getProduct().getName())
                    .size(ci.getSize())
                    .colorName(ci.getColorName())
                    .colorHex(ci.getColorHex())
                    .quantity(ci.getQuantity())
                    .unitPrice(ci.getUnitPrice())
                    .totalPrice(ci.getUnitPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                    .build())
                .collect(Collectors.toList())
        );
        orderRepo.save(saved);
        cartService.clearCart();
        log.info("Order: {} for {}", saved.getOrderNumber(), u.getEmail());
        return toDTO(saved);
    }

    public Page<OrderDTO> getMyOrders(Pageable p) {
        return orderRepo.findByUserIdOrderByCreatedAtDesc(me().getId(), p).map(this::toDTO);
    }

    public OrderDTO getByNum(String num) {
        return toDTO(orderRepo.findByOrderNumber(num).orElseThrow(() -> new RuntimeException("Not found: " + num)));
    }

    public OrderDTO cancel(String num) {
        Order o = orderRepo.findByOrderNumber(num).orElseThrow();
        if (o.getStatus() == Order.OrderStatus.DELIVERED) throw new RuntimeException("Cannot cancel delivered order");
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
        if ("DELIVERED".equals(status)) o.setDeliveredAt(LocalDateTime.now());
        return toDTO(orderRepo.save(o));
    }

    public TrackingDTO track(String num) {
        Order o = orderRepo.findByOrderNumber(num).orElseThrow(() -> new RuntimeException("Not found: " + num));
        List<String> steps = Arrays.asList("PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED");
        Map<String, String> lbl = Map.of(
            "PENDING", "Order Placed",
            "CONFIRMED", "Confirmed",
            "PROCESSING", "Being Prepared",
            "SHIPPED", "Shipped",
            "OUT_FOR_DELIVERY", "Out for Delivery",
            "DELIVERED", "Delivered"
        );

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
            .items(o.getItems().stream().map(i -> OrderItemDTO.builder()
                .id(i.getId())
                .productName(i.getProductName())
                .size(i.getSize())
                .colorName(i.getColorName())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .totalPrice(i.getTotalPrice())
                .build()).collect(Collectors.toList()))
            .build();
    }
}

