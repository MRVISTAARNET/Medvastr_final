package com.medvastr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterRequest {
    private String type;
    private String gender;
    private String fabric;
    private String search;
    private String badge;
    private Double minPrice;
    private Double maxPrice;
    private Long categoryId;
}

