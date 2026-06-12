package com.medvastr.backend.service;

import com.medvastr.backend.model.BulkOrderConfig;
import com.medvastr.backend.repository.BulkOrderConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BulkOrderService {
    private final BulkOrderConfigRepository bulkOrderConfigRepository;

    public List<BulkOrderConfig> getAllActiveTiers() {
        return bulkOrderConfigRepository.findAllActiveTiers();
    }

    public BigDecimal calculateBulkDiscount(Integer quantity) {
        BulkOrderConfig config = bulkOrderConfigRepository.findApplicableTier(quantity, null);
        if (config != null) {
            return config.getDiscountPercentage();
        }
        return BigDecimal.ZERO;
    }

    public BulkOrderConfig getApplicableTier(Integer quantity) {
        return bulkOrderConfigRepository.findApplicableTier(quantity, null);
    }

    public BigDecimal calculateFinalPrice(BigDecimal basePrice, Integer quantity) {
        BigDecimal discount = calculateBulkDiscount(quantity);
        BigDecimal discountAmount = basePrice.multiply(discount).divide(BigDecimal.valueOf(100));
        return basePrice.subtract(discountAmount);
    }

    @Transactional
    public BulkOrderConfig createTier(BulkOrderConfig config) {
        return bulkOrderConfigRepository.save(config);
    }

    @Transactional
    public BulkOrderConfig updateTier(Long id, BulkOrderConfig updates) {
        BulkOrderConfig config = bulkOrderConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tier not found"));
        
        if (updates.getMinQuantity() != null) config.setMinQuantity(updates.getMinQuantity());
        if (updates.getMaxQuantity() != null) config.setMaxQuantity(updates.getMaxQuantity());
        if (updates.getDiscountPercentage() != null) config.setDiscountPercentage(updates.getDiscountPercentage());
        if (updates.getDescription() != null) config.setDescription(updates.getDescription());
        config.setActive(updates.isActive());
        
        return bulkOrderConfigRepository.save(config);
    }

    @Transactional
    public void deleteTier(Long id) {
        bulkOrderConfigRepository.deleteById(id);
    }
}
