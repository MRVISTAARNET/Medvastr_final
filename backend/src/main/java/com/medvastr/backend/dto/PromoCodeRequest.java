package com.medvastr.backend.dto;

import com.medvastr.backend.model.PromoCode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromoCodeRequest {

    @NotBlank
    private String code;
    private String description;
    @NotNull
    private PromoCode.DiscountType discountType;
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal discountValue;
    private BigDecimal minimumOrderAmount;
    private BigDecimal maximumDiscountAmount;
    private Integer usageLimit;
    private Boolean active;
    private LocalDate expiresAt;
}
