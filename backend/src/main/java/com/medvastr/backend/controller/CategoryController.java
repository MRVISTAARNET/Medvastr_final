package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.dto.CategoryDTO;
import com.medvastr.backend.dto.CategoryRequest;
import com.medvastr.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({ "/api/categories", "/categories" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {
    private final CategoryService s;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAll(
            @RequestParam(required = false) String view) {
        if ("tree".equalsIgnoreCase(view)) {
            return ResponseEntity.ok(ApiResponse.ok("Categories", s.getTree()));
        }
        return ResponseEntity.ok(ApiResponse.ok("Categories", s.getAll()));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<CategoryDTO>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok("Category", s.getBySlug(slug)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDTO>> create(@RequestBody CategoryRequest r) {
        return ResponseEntity.status(201).body(ApiResponse.ok("Created", s.create(r)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDTO>> update(@PathVariable Long id, @RequestBody CategoryRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", s.update(id, r)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        s.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}
