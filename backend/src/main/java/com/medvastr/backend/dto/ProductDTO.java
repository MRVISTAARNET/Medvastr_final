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
public class ProductDTO {
    private Long id;
    private String name;
    private String slug;
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
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String fabricDetail;
    private String stretchType;
    private String careInstructions;
    private String weight;
    private String fit;
    private Integer pocketCount;
    private BigDecimal rating;
    private Integer reviewCount;
    private boolean active;
    private boolean featured;
    private String categoryName;
    private List<VariantDTO> variants;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
}
