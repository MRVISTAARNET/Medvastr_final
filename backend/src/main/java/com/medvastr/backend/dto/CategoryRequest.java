package com.medvastr.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String slug;
    private String description;
    private String imageUrl;
    private Integer displayOrder;
    private Long parentId;
    private String navLabel;
    private Boolean showInNav;
}

