package com.medvastr.backend.controller;

import com.medvastr.backend.dto.NavItemDTO;
import com.medvastr.backend.service.NavItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/nav", "/nav"})
@RequiredArgsConstructor
public class NavController {

    private final NavItemService navItemService;

    @GetMapping
    public ResponseEntity<List<NavItemDTO>> getNavigation() {
        return ResponseEntity.ok(navItemService.getActiveTree());
    }
}
