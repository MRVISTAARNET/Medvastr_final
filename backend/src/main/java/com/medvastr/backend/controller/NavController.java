package com.medvastr.backend.controller;

import com.medvastr.backend.dto.NavItemDTO;
import com.medvastr.backend.service.CategoryNavService;
import com.medvastr.backend.service.NavItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/nav", "/nav"})
@RequiredArgsConstructor
public class NavController {

    private final NavItemService navItemService;
    private final CategoryNavService categoryNavService;

    @GetMapping
    public ResponseEntity<List<NavItemDTO>> getNavigation(
            @RequestParam(defaultValue = "categories") String source) {
        if ("legacy".equalsIgnoreCase(source)) {
            return ResponseEntity.ok(navItemService.getActiveTree());
        }
        return ResponseEntity.ok(categoryNavService.buildNavigation());
    }
}
