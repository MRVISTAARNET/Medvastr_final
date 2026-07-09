package com.medvastr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private List<OrderItemDTO> items;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingAmount;
    private BigDecimal totalAmount;
    private String shippingName;
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingPincode;
    private String shippingPhone;
    private String trackingNumber;
    private String courierName;
    private String estimatedDeliveryDate;
    private String promoCode;
    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    private String razorpayOrderId;
    private Long userId;
    private String userEmail;
    private String shiprocketSyncStatus;
}
