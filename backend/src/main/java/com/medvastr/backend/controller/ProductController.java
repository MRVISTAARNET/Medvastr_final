package com.medvastr.backend.controller;

import com.medvastr.backend.dto.*;
import com.medvastr.backend.service.ProductService;
import com.medvastr.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({ "/api/products", "/products" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService s;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String fabric,
            @RequestParam(required = false) String badge,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String cat,
            @RequestParam(required = false) Long categoryId) {
        var f = ProductFilterRequest.builder()
                .type(type)
                .gender(gender)
                .fabric(fabric)
                .badge(badge)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .search(search)
                .categorySlug(cat)
                .categoryId(categoryId)
                .build();
        Sort sort = sortDir.equals("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(ApiResponse.ok("Products", s.getAll(f, PageRequest.of(page, size, sort))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Product", s.getById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductDTO>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok("Product", s.getBySlug(slug)));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> featured() {
        return ResponseEntity.ok(ApiResponse.ok("Featured", s.getFeatured()));
    }

    @GetMapping("/bestsellers")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> bestsellers() {
        return ResponseEntity.ok(ApiResponse.ok("Bestsellers", s.getBestsellers()));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> newArrivals() {
        return ResponseEntity.ok(ApiResponse.ok("New arrivals", s.getNewArrivals()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDTO>> create(
            @Valid @RequestBody ProductRequest r,
            @RequestHeader(value = "X-Admin-Password", required = false) String adminPassword,
            Principal principal) {
        if (!userService.verifyPassword(principal.getName(), adminPassword)) {
            return ResponseEntity.status(403).body(ApiResponse.err("Invalid admin password. Action forbidden."));
        }
        return ResponseEntity.status(201).body(ApiResponse.ok("Created", s.create(r)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDTO>> update(
            @PathVariable Long id, 
            @Valid @RequestBody ProductRequest r,
            @RequestHeader(value = "X-Admin-Password", required = false) String adminPassword,
            Principal principal) {
        if (!userService.verifyPassword(principal.getName(), adminPassword)) {
            return ResponseEntity.status(403).body(ApiResponse.err("Invalid admin password. Action forbidden."));
        }
        return ResponseEntity.ok(ApiResponse.ok("Updated", s.update(id, r)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-Admin-Password", required = false) String adminPassword,
            Principal principal) {
        if (!userService.verifyPassword(principal.getName(), adminPassword)) {
            return ResponseEntity.status(403).body(ApiResponse.err("Invalid admin password. Action forbidden."));
        }
        s.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> reviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Reviews", s.getReviews(id, PageRequest.of(page, size))));
    }

    @GetMapping("/reviews/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> allReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.ok("All reviews", s.getAllReviews(PageRequest.of(page, size))));
    }

    @GetMapping("/reviews/public")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> publicReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Latest reviews", s.getPublicReviews(PageRequest.of(page, size))));
    }

    @PostMapping("/{id}/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewDTO>> addReview(
            @PathVariable Long id,
            @RequestBody ReviewRequest r,
            Principal principal) {
        com.medvastr.backend.model.User user = userService.getByEmail(principal.getName());
        return ResponseEntity.status(201)
                .body(ApiResponse.ok("Review submitted for approval", s.addReview(id, r, user)));
    }

    @PostMapping("/reviews/{reviewId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReviewDTO>> approveReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(ApiResponse.ok("Review approved", s.approveReview(reviewId)));
    }

    @DeleteMapping("/reviews/{reviewId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> rejectReview(@PathVariable Long reviewId) {
        s.rejectReview(reviewId);
        return ResponseEntity.ok(ApiResponse.ok("Review rejected", null));
    }
}
