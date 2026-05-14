package com.medvastr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {
    private Long productId;
    private Long variantId;
    private String size;
    private String colorHex;
    private String colorName;
    private Integer quantity;
}

