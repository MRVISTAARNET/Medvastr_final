package com.medvastr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String emoji;
    private String bgColor;
    private String size;
    private String colorName;
    private String colorHex;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}

