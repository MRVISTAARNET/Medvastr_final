package com.medvastr.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String type;

    @NotBlank
    @JsonAlias("gen")
    private String gender;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal price;

    @JsonAlias("desc")
    private String description;

    private String shortDescription;
    private String material;
    private String tags;
    private String seoTitle;
    private String seoDescription;

    @JsonAlias("fab")
    private String fabric;

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
    private BigDecimal originalPrice;

    @JsonAlias("pockets")
    private Integer pocketCount;

    @JsonAlias("catId")
    private Long categoryId;

    @JsonAlias("subCategoryId")
    private Long subcategoryId;

    @JsonAlias("childCategoryId")
    private Long childCategoryId;

    @NotEmpty
    private List<VariantDTO> variants;

    @JsonAlias("imgs")
    private List<String> imageUrls;

    private String videoUrl;

    private String categoryIds;
}
