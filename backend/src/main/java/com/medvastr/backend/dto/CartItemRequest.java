package com.medvastr.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {

    @NotNull
    private Long productId;

    private Long variantId;
    private String size;
    private String colorHex;
    private String colorName;

    @Min(1)
    private Integer quantity;
}

