package com.medvastr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLogDTO {
    private Long id;
    private Long variantId;
    private String sku;
    private Integer changeQuantity;
    private Integer previousStock;
    private Integer newStock;
    private String actionType;
    private String notes;
    private LocalDateTime createdAt;
}
