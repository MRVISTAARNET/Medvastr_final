package com.medvastr.backend.service;

import com.medvastr.backend.dto.BulkVariantStockRequest;
import com.medvastr.backend.dto.VariantDTO;
import com.medvastr.backend.dto.VariantStockRequest;
import com.medvastr.backend.model.ProductVariant;
import com.medvastr.backend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final ProductVariantRepository variantRepo;

    public List<VariantDTO> getProductVariants(Long productId) {
        return variantRepo.findByProductIdOrderBySizeAsc(productId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public VariantDTO updateStock(Long variantId, Integer stockQuantity) {
        ProductVariant variant = variantRepo.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found: " + variantId));
        if (stockQuantity < 0) {
            throw new RuntimeException("Stock cannot be negative");
        }
        variant.setStockQuantity(stockQuantity);
        return toDTO(variantRepo.save(variant));
    }

    @Transactional
    public List<VariantDTO> bulkUpdateStock(BulkVariantStockRequest request) {
        List<VariantDTO> updated = new ArrayList<>();
        if (request.getUpdates() == null) {
            return updated;
        }
        for (VariantStockRequest item : request.getUpdates()) {
            updated.add(updateStock(item.getVariantId(), item.getStockQuantity()));
        }
        return updated;
    }

    private VariantDTO toDTO(ProductVariant v) {
        return VariantDTO.builder()
                .id(v.getId())
                .size(v.getSize())
                .colorName(v.getColorName())
                .colorHex(v.getColorHex())
                .sku(v.getSku())
                .barcode(v.getBarcode())
                .stockQuantity(v.getStockQuantity())
                .variantPrice(v.getVariantPrice())
                .variantOriginalPrice(v.getVariantOriginalPrice())
                .imageUrl(v.getImageUrl())
                .active(v.getActive())
                .build();
    }
}
