package com.medvastr.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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

    @JsonAlias("fab")
    private String fabric;

    private String type;

    @JsonAlias("gen")
    private String gender;

    private String badge;
    private String brand;
    private String styleId;
    private String barcode;
    private String sku;

    @JsonAlias("emo")
    private String emoji;

    @JsonAlias("bg")
    private String bgColor;

    @JsonAlias("fabD")
    private String fabricDetail;

    @JsonAlias("stretch")
    private String stretchType;

    @JsonAlias("care")
    private String careInstructions;

    @JsonAlias("wt")
    private String weight;

    private String fit;
    private BigDecimal price;
    private BigDecimal originalPrice;

    @JsonAlias("pockets")
    private Integer pocketCount;

    @JsonAlias("catId")
    private Long categoryId;

    private List<VariantDTO> variants;

    @JsonAlias("imgs")
    private List<String> imageUrls;

    private String videoUrl;
}
