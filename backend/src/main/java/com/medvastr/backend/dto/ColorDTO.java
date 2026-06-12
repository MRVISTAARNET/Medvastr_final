package com.medvastr.backend.dto;

import com.medvastr.backend.model.ProductColor;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColorDTO {
    private Long id;
    private String name;
    private String hexCode;
    private Integer displayOrder;
    private boolean active;

    public static ColorDTO from(ProductColor c) {
        return ColorDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .hexCode(c.getHexCode())
                .displayOrder(c.getDisplayOrder())
                .active(c.isActive())
                .build();
    }
}
