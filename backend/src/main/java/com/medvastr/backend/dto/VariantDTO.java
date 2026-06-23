package com.medvastr.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantDTO {
    private Long id;

    @NotBlank(message = "Size is required")
    private String size;

    @NotBlank(message = "Color name is required")
    private String colorName;

    @NotBlank(message = "Color hex is required")
    private String colorHex;

    @NotBlank(message = "SKU is required")
    private String sku;

    private String barcode;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @NotNull(message = "Variant price is required")
    @DecimalMin(value = "0.01", message = "Variant price must be at least 0.01")
    private java.math.BigDecimal variantPrice;

    private java.math.BigDecimal variantOriginalPrice;
    private Double weight;
    
    /** Primary product photo for this color (set on one variant per color) */
    private String imageUrl;
    
    @Builder.Default
    private Boolean active = true;
}
