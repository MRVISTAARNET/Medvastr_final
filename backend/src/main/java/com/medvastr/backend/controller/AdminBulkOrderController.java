package com.medvastr.backend.controller;

import com.medvastr.backend.model.BulkOrderConfig;
import com.medvastr.backend.service.BulkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bulk-orders")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminBulkOrderController {
    private final BulkOrderService bulkOrderService;

    @GetMapping("/tiers")
    public ResponseEntity<List<BulkOrderConfig>> getAllTiers() {
        List<BulkOrderConfig> tiers = bulkOrderService.getAllActiveTiers();
        return ResponseEntity.ok(tiers);
    }

    @PostMapping("/tiers")
    public ResponseEntity<?> createTier(@RequestBody BulkOrderConfig config) {
        try {
            BulkOrderConfig created = bulkOrderService.createTier(config);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating tier: " + e.getMessage());
        }
    }

    @PutMapping("/tiers/{id}")
    public ResponseEntity<?> updateTier(@PathVariable Long id, @RequestBody BulkOrderConfig updates) {
        try {
            BulkOrderConfig updated = bulkOrderService.updateTier(id, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating tier: " + e.getMessage());
        }
    }

    @DeleteMapping("/tiers/{id}")
    public ResponseEntity<?> deleteTier(@PathVariable Long id) {
        try {
            bulkOrderService.deleteTier(id);
            return ResponseEntity.ok("Tier deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting tier: " + e.getMessage());
        }
    }

    @PostMapping("/calculate-discount")
    public ResponseEntity<?> calculateDiscount(@RequestBody Map<String, Integer> request) {
        try {
            Integer quantity = request.get("quantity");
            BigDecimal discount = bulkOrderService.calculateBulkDiscount(quantity);
            return ResponseEntity.ok(Map.of(
                    "quantity", quantity,
                    "discountPercentage", discount
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating discount: " + e.getMessage());
        }
    }
}
