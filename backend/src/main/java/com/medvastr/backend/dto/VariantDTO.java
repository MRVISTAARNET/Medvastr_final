package com.medvastr.backend.dto;

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
    private String size;
    private String colorName;
    private String colorHex;
    private String sku;
    private Integer stockQuantity;
    /** Primary product photo for this color (set on one variant per color) */
    private String imageUrl;
    @Builder.Default
    private Boolean active = true;
}
