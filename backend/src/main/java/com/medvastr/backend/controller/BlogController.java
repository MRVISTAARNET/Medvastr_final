package com.medvastr.backend.controller;

import com.medvastr.backend.dto.BlogPostDTO;
import com.medvastr.backend.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/blog", "/blog"})
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    @GetMapping("/posts")
    public ResponseEntity<Page<BlogPostDTO>> listPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(blogService.getPublished(PageRequest.of(page, size)));
    }

    @GetMapping("/posts/{slug}")
    public ResponseEntity<BlogPostDTO> getPost(@PathVariable String slug) {
        return ResponseEntity.ok(blogService.getPublishedBySlug(slug));
    }

    @GetMapping("/posts/{slug}/related")
    public ResponseEntity<List<BlogPostDTO>> getRelated(@PathVariable String slug) {
        BlogPostDTO post = blogService.getPublishedBySlug(slug);
        return ResponseEntity.ok(blogService.getRelated(post.getId()));
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(blogService.getCategories());
    }
}
