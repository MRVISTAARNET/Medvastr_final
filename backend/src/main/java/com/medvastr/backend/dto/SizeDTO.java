package com.medvastr.backend.dto;

import com.medvastr.backend.model.ProductSize;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SizeDTO {
    private Long id;
    private String name;
    private String sizeValue;
    private String category;
    private Integer displayOrder;
    private boolean active;

    public static SizeDTO from(ProductSize s) {
        return SizeDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .sizeValue(s.getSizeValue())
                .category(s.getCategory())
                .displayOrder(s.getDisplayOrder())
                .active(s.isActive())
                .build();
    }
}
