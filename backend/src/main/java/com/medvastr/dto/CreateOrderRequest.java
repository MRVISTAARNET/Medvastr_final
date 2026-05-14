package com.medvastr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private Long addressId;
    private String paymentMethod;
    private String promoCode;
    private String notes;
    private List<CartItemRequest> items;
}

