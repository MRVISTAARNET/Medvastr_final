package com.medvastr.backend.dto;

import com.medvastr.backend.model.Banner;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerDTO {
    private Long id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private Banner.BannerPosition position;
    private Integer displayOrder;

    @JsonProperty("isActive")
    private Boolean isActive;

    private LocalDateTime createdAt;

    public boolean isActive() {
        return isActive != null && isActive;
    }
}
