package com.medvastr.backend.service;

import com.medvastr.backend.dto.PromoCodeDTO;
import com.medvastr.backend.dto.PromoCodeRequest;
import com.medvastr.backend.dto.PromoResponse;
import com.medvastr.backend.model.PromoCode;
import com.medvastr.backend.repository.PromoCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PromoCodeService {

    private final PromoCodeRepository promoRepo;

    public List<PromoCodeDTO> getAll() {
        return promoRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PromoCodeDTO getById(Long id) {
        return toDTO(promoRepo.findById(id).orElseThrow(() -> new RuntimeException("Promo not found")));
    }

    public PromoCodeDTO create(PromoCodeRequest r) {
        if (r.getCode() == null || r.getCode().isBlank()) {
            throw new RuntimeException("Promo code is required");
        }
        if (promoRepo.existsByCodeIgnoreCase(r.getCode())) {
            throw new RuntimeException("Promo code already exists");
        }
        PromoCode pc = PromoCode.builder()
                .code(r.getCode().trim().toUpperCase())
                .description(r.getDescription())
                .discountType(r.getDiscountType() != null ? r.getDiscountType() : PromoCode.DiscountType.PERCENTAGE)
                .discountValue(r.getDiscountValue())
                .minimumOrderAmount(r.getMinimumOrderAmount() != null ? r.getMinimumOrderAmount() : BigDecimal.ZERO)
                .maximumDiscountAmount(r.getMaximumDiscountAmount())
                .usageLimit(r.getUsageLimit())
                .usedCount(0)
                .active(r.getActive() == null || r.getActive())
                .expiresAt(r.getExpiresAt())
                .build();
        return toDTO(promoRepo.save(pc));
    }

    public PromoCodeDTO update(Long id, PromoCodeRequest r) {
        PromoCode pc = promoRepo.findById(id).orElseThrow(() -> new RuntimeException("Promo not found"));
        if (r.getCode() != null && !r.getCode().equalsIgnoreCase(pc.getCode())) {
            if (promoRepo.existsByCodeIgnoreCase(r.getCode())) {
                throw new RuntimeException("Promo code already exists");
            }
            pc.setCode(r.getCode().trim().toUpperCase());
        }
        if (r.getDescription() != null) pc.setDescription(r.getDescription());
        if (r.getDiscountType() != null) pc.setDiscountType(r.getDiscountType());
        if (r.getDiscountValue() != null) pc.setDiscountValue(r.getDiscountValue());
        if (r.getMinimumOrderAmount() != null) pc.setMinimumOrderAmount(r.getMinimumOrderAmount());
        if (r.getMaximumDiscountAmount() != null) pc.setMaximumDiscountAmount(r.getMaximumDiscountAmount());
        if (r.getUsageLimit() != null) pc.setUsageLimit(r.getUsageLimit());
        if (r.getActive() != null) pc.setActive(r.getActive());
        if (r.getExpiresAt() != null) pc.setExpiresAt(r.getExpiresAt());
        return toDTO(promoRepo.save(pc));
    }

    public void delete(Long id) {
        PromoCode pc = promoRepo.findById(id).orElseThrow(() -> new RuntimeException("Promo not found"));
        pc.setActive(false);
        promoRepo.save(pc);
    }

    public PromoResponse validate(String code, BigDecimal subtotal) {
        if (code == null || code.isBlank()) {
            return PromoResponse.builder().valid(false).message("Enter a promo code").build();
        }
        return promoRepo.findByCodeIgnoreCaseAndActiveTrue(code.trim()).map(pc -> {
            if (pc.getExpiresAt() != null && pc.getExpiresAt().isBefore(LocalDate.now())) {
                return PromoResponse.builder().valid(false).message("Promo code has expired").build();
            }
            if (pc.getUsageLimit() != null && pc.getUsedCount() >= pc.getUsageLimit()) {
                return PromoResponse.builder().valid(false).message("Promo code usage limit reached").build();
            }
            if (pc.getMinimumOrderAmount() != null && subtotal.compareTo(pc.getMinimumOrderAmount()) < 0) {
                return PromoResponse.builder()
                        .valid(false)
                        .message("Minimum order INR " + pc.getMinimumOrderAmount() + " required")
                        .build();
            }
            BigDecimal discount = calcDiscount(pc, subtotal);
            return PromoResponse.builder()
                    .valid(true)
                    .message(pc.getCode() + " applied!")
                    .discountAmount(discount)
                    .discountType(pc.getDiscountType().name())
                    .discountValue(pc.getDiscountValue())
                    .build();
        }).orElse(PromoResponse.builder().valid(false).message("Invalid or expired promo code").build());
    }

    public BigDecimal calcDiscount(PromoCode pc, BigDecimal subtotal) {
        BigDecimal d = pc.getDiscountType() == PromoCode.DiscountType.PERCENTAGE
                ? subtotal.multiply(pc.getDiscountValue()).divide(BigDecimal.valueOf(100))
                : pc.getDiscountValue();
        if (pc.getMaximumDiscountAmount() != null && d.compareTo(pc.getMaximumDiscountAmount()) > 0) {
            d = pc.getMaximumDiscountAmount();
        }
        return d;
    }

    public void incrementUsage(String code) {
        promoRepo.findByCodeIgnoreCaseAndActiveTrue(code).ifPresent(pc -> {
            pc.setUsedCount(pc.getUsedCount() + 1);
            promoRepo.save(pc);
        });
    }

    private PromoCodeDTO toDTO(PromoCode pc) {
        return PromoCodeDTO.builder()
                .id(pc.getId())
                .code(pc.getCode())
                .description(pc.getDescription())
                .discountType(pc.getDiscountType())
                .discountValue(pc.getDiscountValue())
                .minimumOrderAmount(pc.getMinimumOrderAmount())
                .maximumDiscountAmount(pc.getMaximumDiscountAmount())
                .usageLimit(pc.getUsageLimit())
                .usedCount(pc.getUsedCount())
                .active(pc.isActive())
                .expiresAt(pc.getExpiresAt())
                .createdAt(pc.getCreatedAt())
                .build();
    }
}
