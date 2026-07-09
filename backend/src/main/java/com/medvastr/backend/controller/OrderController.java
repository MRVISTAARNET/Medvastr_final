package com.medvastr.backend.controller;

import com.medvastr.backend.dto.*;
import com.medvastr.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({ "/api/orders", "/orders" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderService s;

    @GetMapping("/shipping-fee")
    public ResponseEntity<ApiResponse<java.math.BigDecimal>> getShippingFee(@RequestParam java.math.BigDecimal subtotal) {
        return ResponseEntity.ok(ApiResponse.ok("Shipping fee calculated", s.calculateShippingFee(subtotal)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDTO>> create(@RequestBody CreateOrderRequest r) {
        return ResponseEntity.status(201).body(ApiResponse.ok("Order placed", s.createOrder(r)));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<ApiResponse<OrderDTO>> verify(@RequestBody PaymentVerificationRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Payment verified", s.verifyPayment(r)));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<OrderDTO>>> mine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Orders", s.getMyOrders(PageRequest.of(page, size))));
    }

    @GetMapping("/{num}")
    public ResponseEntity<ApiResponse<OrderDTO>> get(@PathVariable String num) {
        return ResponseEntity.ok(ApiResponse.ok("Order", s.getByNum(num)));
    }

    @PostMapping("/{num}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDTO>> cancel(@PathVariable String num) {
        return ResponseEntity.ok(ApiResponse.ok("Cancelled", s.cancel(num)));
    }

    @GetMapping("/track/{num}")
    public ResponseEntity<ApiResponse<TrackingDTO>> track(@PathVariable String num) {
        return ResponseEntity.ok(ApiResponse.ok("Tracking", s.track(num)));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderDTO>>> all(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok("All orders", s.getAll(status, PageRequest.of(page, size))));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDTO>> status(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", s.updateStatus(id, status)));
    }

    @PostMapping("/admin/{id}/shiprocket")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDTO>> pushToShiprocket(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Pushed to Shiprocket", s.pushToShiprocket(id)));
    }

    @PostMapping("/admin/{id}/shiprocket-sync")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> pushToShiprocketSync(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Sync push attempted", s.pushToShiprocketSync(id)));
    }

    @PutMapping("/admin/{id}/rename")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDTO>> rename(@PathVariable Long id, @RequestParam String orderNumber) {
        return ResponseEntity.ok(ApiResponse.ok("Order number updated", s.renameOrder(id, orderNumber)));
    }

    /** Pull latest status from Shiprocket for a single order */
    @PostMapping("/admin/{id}/sync-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDTO>> syncStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Synced from Shiprocket", s.syncOrderFromShiprocket(id)));
    }

    /** Bulk-sync all active orders with an AWB from Shiprocket */
    @PostMapping("/admin/sync-shiprocket")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> syncAll() {
        int count = s.syncAllFromShiprocket();
        return ResponseEntity.ok(ApiResponse.ok("Bulk sync complete", count + " orders synced from Shiprocket"));
    }
}
