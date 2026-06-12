package com.medvastr.backend.controller;

import com.medvastr.backend.dto.SizeDTO;
import com.medvastr.backend.service.SizeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sizes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminSizeController {

    private final SizeService sizeService;

    @GetMapping
    public ResponseEntity<List<SizeDTO>> getAll() {
        return ResponseEntity.ok(sizeService.getAll());
    }

    @PostMapping
    public ResponseEntity<SizeDTO> create(@RequestBody SizeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sizeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SizeDTO> update(@PathVariable Long id, @RequestBody SizeDTO dto) {
        return ResponseEntity.ok(sizeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sizeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> orderedIds) {
        sizeService.reorder(orderedIds);
        return ResponseEntity.ok().build();
    }
}
