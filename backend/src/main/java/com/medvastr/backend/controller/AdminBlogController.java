package com.medvastr.backend.controller;

import com.medvastr.backend.dto.BlogPostDTO;
import com.medvastr.backend.model.BlogCategory;
import com.medvastr.backend.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/blog")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminBlogController {

    private final BlogService blogService;

    @GetMapping("/posts")
    public ResponseEntity<List<BlogPostDTO>> getAllPosts() {
        return ResponseEntity.ok(blogService.getAllPosts());
    }

    @PostMapping("/posts")
    public ResponseEntity<BlogPostDTO> createPost(@RequestBody BlogPostDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blogService.create(dto));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<BlogPostDTO> updatePost(@PathVariable Long id, @RequestBody BlogPostDTO dto) {
        return ResponseEntity.ok(blogService.update(id, dto));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        blogService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<BlogCategory>> getCategories() {
        return ResponseEntity.ok(blogService.getCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<BlogCategory> createCategory(@RequestBody BlogCategory cat) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blogService.createCategory(cat));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<BlogCategory> updateCategory(@PathVariable Long id, @RequestBody BlogCategory cat) {
        return ResponseEntity.ok(blogService.updateCategory(id, cat));
    }
}
