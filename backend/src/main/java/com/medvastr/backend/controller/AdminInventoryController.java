package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.dto.BulkVariantStockRequest;
import com.medvastr.backend.dto.VariantDTO;
import com.medvastr.backend.dto.VariantStockRequest;
import com.medvastr.backend.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/admin/inventory", "/admin/inventory"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/products/{productId}/variants")
    public ResponseEntity<ApiResponse<List<VariantDTO>>> getVariants(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok("Variants", inventoryService.getProductVariants(productId)));
    }

    @PatchMapping("/variants/{variantId}")
    public ResponseEntity<ApiResponse<VariantDTO>> updateVariantStock(
            @PathVariable Long variantId,
            @Valid @RequestBody VariantStockRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Stock updated",
                inventoryService.updateStock(variantId, request.getStockQuantity())));
    }

    @PutMapping("/variants/bulk")
    public ResponseEntity<ApiResponse<List<VariantDTO>>> bulkUpdate(
            @Valid @RequestBody BulkVariantStockRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Stock updated", inventoryService.bulkUpdateStock(request)));
    }
}
