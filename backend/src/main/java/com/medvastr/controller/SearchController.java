package com.medvastr.controller;

import com.medvastr.dto.ApiResponse;
import com.medvastr.dto.ProductDTO;
import com.medvastr.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SearchController {
    private final ProductService s;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.ok("Results", s.search(q, PageRequest.of(page, size))));
    }

    @GetMapping("/suggest")
    public ResponseEntity<ApiResponse<List<String>>> suggest(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok("Suggestions", s.suggest(q)));
    }
}
