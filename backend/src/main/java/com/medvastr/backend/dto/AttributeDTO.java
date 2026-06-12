package com.medvastr.backend.dto;

import com.medvastr.backend.model.ProductAttribute;
import com.medvastr.backend.model.ProductAttributeValue;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttributeDTO {
    private Long id;
    private String name;
    private String slug;
    private ProductAttribute.AttributeType attributeType;
    private Integer displayOrder;
    private boolean active;
    private boolean filterable;
    private List<AttributeValueDTO> values;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttributeValueDTO {
        private Long id;
        private String value;
        private Integer displayOrder;
        private boolean active;
    }

    public static AttributeDTO from(ProductAttribute attr) {
        return AttributeDTO.builder()
                .id(attr.getId())
                .name(attr.getName())
                .slug(attr.getSlug())
                .attributeType(attr.getAttributeType())
                .displayOrder(attr.getDisplayOrder())
                .active(attr.isActive())
                .filterable(attr.isFilterable())
                .values(attr.getValues() != null
                        ? attr.getValues().stream()
                                .filter(ProductAttributeValue::isActive)
                                .map(v -> AttributeValueDTO.builder()
                                        .id(v.getId())
                                        .value(v.getValue())
                                        .displayOrder(v.getDisplayOrder())
                                        .active(v.isActive())
                                        .build())
                                .collect(Collectors.toList())
                        : List.of())
                .build();
    }
}
