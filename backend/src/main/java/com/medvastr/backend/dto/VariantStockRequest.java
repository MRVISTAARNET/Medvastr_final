package com.medvastr.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantStockRequest {
    @NotNull
    private Long variantId;
    @NotNull
    private Integer stockQuantity;
}
