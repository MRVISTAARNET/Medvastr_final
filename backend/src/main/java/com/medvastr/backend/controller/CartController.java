package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.dto.CartDTO;
import com.medvastr.backend.dto.CartItemRequest;
import com.medvastr.backend.dto.PromoResponse;
import com.medvastr.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class CartController {
    private final CartService s;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDTO>> get() {
        return ResponseEntity.ok(ApiResponse.ok("Cart", s.getCart()));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartDTO>> add(@RequestBody CartItemRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Added", s.addItem(r)));
    }

    @PutMapping("/item/{id}")
    public ResponseEntity<ApiResponse<CartDTO>> update(@PathVariable Long id, @RequestParam Integer quantity) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", s.updateItem(id, quantity)));
    }

    @DeleteMapping("/item/{id}")
    public ResponseEntity<ApiResponse<CartDTO>> remove(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Removed", s.removeItem(id)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clear() {
        s.clearCart();
        return ResponseEntity.ok(ApiResponse.ok("Cleared", null));
    }

    @PostMapping("/promo")
    public ResponseEntity<ApiResponse<PromoResponse>> promo(@RequestParam String code, @RequestParam Double total) {
        return ResponseEntity.ok(ApiResponse.ok("Promo", s.validatePromo(code, total)));
    }
}
