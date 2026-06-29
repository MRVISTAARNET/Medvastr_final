package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.dto.DashboardDTO;
import com.medvastr.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.medvastr.backend.repository.*;

@RestController
@RequestMapping({ "/api/admin", "/admin" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AnalyticsService s;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardDTO>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard", s.getDashboard()));
    }

    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final CartRepository cartRepo;
    private final CartItemRepository cartItemRepo;
    private final ProductRepository productRepo;
    private final ProductVariantRepository variantRepo;
    private final InventoryLogRepository invRepo;

    @PostMapping("/system/wipe-test-data")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<ApiResponse<String>> wipeTestData() {
        cartItemRepo.deleteAll();
        cartRepo.deleteAll();
        orderItemRepo.deleteAll();
        orderRepo.deleteAll();
        invRepo.deleteAll();
        variantRepo.deleteAll();
        productRepo.deleteAll();
        return ResponseEntity.ok(ApiResponse.ok("Test data wiped successfully. Please refresh the page.", "OK"));
    }
}
