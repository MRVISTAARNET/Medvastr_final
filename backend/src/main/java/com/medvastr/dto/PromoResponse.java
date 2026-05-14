package com.medvastr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromoResponse {
    private boolean valid;
    private String message;
    private String discountType;
    private BigDecimal discountAmount;
    private BigDecimal discountValue;
}

