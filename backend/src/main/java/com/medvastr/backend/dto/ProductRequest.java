package com.medvastr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    private String name;
    private String description;
    private String fabric;
    private String type;
    private String gender;
    private String badge;
    private String brand;
    private String styleId;
    private String barcode;
    private String sku;
    private String emoji;
    private String bgColor;
    private String fabricDetail;
    private String stretchType;
    private String careInstructions;
    private String weight;
    private String fit;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer pocketCount;
    private Long categoryId;
    private List<VariantDTO> variants;
    private List<String> imageUrls;
}
