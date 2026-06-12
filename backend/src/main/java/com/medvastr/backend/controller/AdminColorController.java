package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ColorDTO;
import com.medvastr.backend.service.ColorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/colors")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminColorController {

    private final ColorService colorService;

    @GetMapping
    public ResponseEntity<List<ColorDTO>> getAll() {
        return ResponseEntity.ok(colorService.getAll());
    }

    @PostMapping
    public ResponseEntity<ColorDTO> create(@RequestBody ColorDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(colorService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ColorDTO> update(@PathVariable Long id, @RequestBody ColorDTO dto) {
        return ResponseEntity.ok(colorService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        colorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> orderedIds) {
        colorService.reorder(orderedIds);
        return ResponseEntity.ok().build();
    }
}
