package com.medvastr.backend.service;

import com.medvastr.backend.dto.PromoCodeDTO;
import com.medvastr.backend.dto.PromoCodeRequest;
import com.medvastr.backend.dto.PromoResponse;
import com.medvastr.backend.model.PromoCode;
import com.medvastr.backend.repository.PromoCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PromoCodeService {

    private final PromoCodeRepository promoRepo;

    @Transactional(readOnly = true)
    public List<PromoCodeDTO> getAll() {
        return promoRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
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
        String searchCode = code.trim();
        java.util.Optional<PromoCode> opt = java.util.Optional.empty();
        try {
            opt = promoRepo.findByCodeIgnoreCaseAndActiveTrue(searchCode);
            if (opt.isEmpty()) {
                if ("MEDVARN10".equalsIgnoreCase(searchCode)) {
                    opt = promoRepo.findByCodeIgnoreCaseAndActiveTrue("MEDVASTR10");
                } else if ("MEDVASTR10".equalsIgnoreCase(searchCode)) {
                    opt = promoRepo.findByCodeIgnoreCaseAndActiveTrue("MEDVARN10");
                }
            }
        } catch (Exception e) {
            log.warn("Error looking up promo code {}: {}", searchCode, e.getMessage());
        }

        if (opt.isEmpty() && ("MEDVARN10".equalsIgnoreCase(searchCode) || "MEDVASTR10".equalsIgnoreCase(searchCode))) {
            PromoCode autoCode = PromoCode.builder()
                    .code(searchCode.toUpperCase())
                    .description("10% Welcome Discount")
                    .discountType(PromoCode.DiscountType.PERCENTAGE)
                    .discountValue(BigDecimal.TEN)
                    .minimumOrderAmount(BigDecimal.ZERO)
                    .usedCount(0)
                    .active(true)
                    .build();
            try {
                autoCode = promoRepo.save(autoCode);
            } catch (Exception e) {
                log.warn("Could not save auto-created promo code to DB: {}", e.getMessage());
            }
            opt = java.util.Optional.of(autoCode);
        }

        return opt.map(pc -> {
            if (pc.getExpiresAt() != null && pc.getExpiresAt().isBefore(LocalDate.now())) {
                return PromoResponse.builder().valid(false).message("Promo code has expired").build();
            }
            int used = pc.getUsedCount() != null ? pc.getUsedCount() : 0;
            if (pc.getUsageLimit() != null && used >= pc.getUsageLimit()) {
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
                    .message((pc.getCode() != null ? pc.getCode() : searchCode) + " applied!")
                    .discountAmount(discount)
                    .discountType(pc.getDiscountType() != null ? pc.getDiscountType().name() : "PERCENTAGE")
                    .discountValue(pc.getDiscountValue() != null ? pc.getDiscountValue() : BigDecimal.TEN)
                    .build();
        }).orElse(PromoResponse.builder().valid(false).message("Invalid or expired promo code").build());
    }

    public BigDecimal calcDiscount(PromoCode pc, BigDecimal subtotal) {
        if (pc == null || subtotal == null) return BigDecimal.ZERO;
        BigDecimal val = pc.getDiscountValue() != null ? pc.getDiscountValue() : BigDecimal.ZERO;
        BigDecimal d = (pc.getDiscountType() == PromoCode.DiscountType.PERCENTAGE)
                ? subtotal.multiply(val).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP)
                : val;
        if (pc.getMaximumDiscountAmount() != null
                && pc.getMaximumDiscountAmount().compareTo(BigDecimal.ZERO) > 0
                && d.compareTo(pc.getMaximumDiscountAmount()) > 0) {
            d = pc.getMaximumDiscountAmount();
        }
        return d;
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void incrementUsage(String code) {
        if (code == null || code.isBlank()) return;
        try {
            promoRepo.findByCodeIgnoreCaseAndActiveTrue(code.trim()).ifPresent(pc -> {
                int current = pc.getUsedCount() != null ? pc.getUsedCount() : 0;
                pc.setUsedCount(current + 1);
                promoRepo.save(pc);
            });
        } catch (Exception e) {
            log.warn("Failed to increment usage for promo code {}: {}", code, e.getMessage());
        }
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
                .usedCount(pc.getUsedCount() != null ? pc.getUsedCount() : 0)
                .active(pc.isActive())
                .expiresAt(pc.getExpiresAt())
                .createdAt(pc.getCreatedAt())
                .build();
    }
}

