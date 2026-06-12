package com.medvastr.backend.controller;

import com.medvastr.backend.dto.NavItemDTO;
import com.medvastr.backend.service.NavItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/nav")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminNavController {

    private final NavItemService navItemService;

    @GetMapping
    public ResponseEntity<List<NavItemDTO>> getAll() {
        return ResponseEntity.ok(navItemService.getAll());
    }

    @PostMapping
    public ResponseEntity<NavItemDTO> create(@RequestBody NavItemDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(navItemService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NavItemDTO> update(@PathVariable Long id, @RequestBody NavItemDTO dto) {
        return ResponseEntity.ok(navItemService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        navItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> orderedIds) {
        navItemService.reorder(orderedIds);
        return ResponseEntity.ok().build();
    }
}
