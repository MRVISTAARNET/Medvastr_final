package com.medvastr.backend.controller;

import com.medvastr.backend.model.BulkOrderConfig;
import com.medvastr.backend.service.BulkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bulk-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BulkOrderController {
    private final BulkOrderService bulkOrderService;

    @GetMapping("/tiers")
    public ResponseEntity<List<BulkOrderConfig>> getAllTiers() {
        List<BulkOrderConfig> tiers = bulkOrderService.getAllActiveTiers();
        return ResponseEntity.ok(tiers);
    }

    @GetMapping("/calculate-discount")
    public ResponseEntity<?> getDiscount(@RequestParam Integer quantity) {
        try {
            BulkOrderConfig tier = bulkOrderService.getApplicableTier(quantity);
            if (tier != null) {
                return ResponseEntity.ok(Map.of(
                        "quantity", quantity,
                        "minQuantity", tier.getMinQuantity(),
                        "maxQuantity", tier.getMaxQuantity(),
                        "discountPercentage", tier.getDiscountPercentage(),
                        "description", tier.getDescription() != null ? tier.getDescription() : ""
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                        "quantity", quantity,
                        "discountPercentage", BigDecimal.ZERO,
                        "message", "No bulk discount available"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
