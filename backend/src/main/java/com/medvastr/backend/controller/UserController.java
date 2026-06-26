package com.medvastr.backend.controller;

import com.medvastr.backend.dto.*;
import com.medvastr.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({ "/api/users", "/users" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService s;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> me() {
        return ResponseEntity.ok(ApiResponse.ok("Profile", s.getProfile()));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDTO>> update(@RequestBody UpdateProfileRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", s.updateProfile(r)));
    }

    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> pwd(@RequestBody ChangePasswordRequest r) {
        s.changePassword(r);
        return ResponseEntity.ok(ApiResponse.ok("Changed", null));
    }

    @GetMapping("/me/addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AddressDTO>>> addr() {
        return ResponseEntity.ok(ApiResponse.ok("Addresses", s.getAddresses()));
    }

    @PostMapping("/me/addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AddressDTO>> addAddr(@RequestBody AddressRequest r) {
        return ResponseEntity.status(201).body(ApiResponse.ok("Added", s.addAddress(r)));
    }

    @PutMapping("/me/addresses/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AddressDTO>> updateAddr(@PathVariable Long id, @RequestBody AddressRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", s.updateAddress(id, r)));
    }

    @DeleteMapping("/me/addresses/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteAddr(@PathVariable Long id) {
        s.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }

    @GetMapping("/me/wishlist")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<com.medvastr.backend.dto.WishlistResponseDTO>>> wish() {
        return ResponseEntity.ok(ApiResponse.ok("Wishlist", s.getWishlist()));
    }

    @PostMapping("/me/wishlist/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> toggleWish(@PathVariable Long id, @RequestParam(required = false) String variantId) {
        s.toggleWishlist(id, variantId);
        return ResponseEntity.ok(ApiResponse.ok("Toggled", null));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> all(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Users", s.getAll(PageRequest.of(page, size))));
    }
}
