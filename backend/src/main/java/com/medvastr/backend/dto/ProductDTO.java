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
    private String shortDescription;
    private String material;
    private String tags;
    private String seoTitle;
    private String seoDescription;
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
    private Long categoryId;
    private Long subcategoryId;
    private String subcategoryName;
    private Long childCategoryId;
    private String childCategoryName;
    private List<VariantDTO> variants;
    private List<ProductImageDTO> images;
    private List<String> imageUrls;
    private List<String> sizes;
    private LocalDateTime createdAt;
}
