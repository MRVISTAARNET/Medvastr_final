package com.medvastr.backend.dto;

import com.medvastr.backend.model.Collection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectionDTO {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Collection.CollectionType collectionType;
    private Integer displayOrder;
    private boolean isActive;
    private Integer productCount;
    private List<ProductDTO> products;
    private LocalDateTime createdAt;
}
