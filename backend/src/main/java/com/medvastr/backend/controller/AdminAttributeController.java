package com.medvastr.backend.controller;

import com.medvastr.backend.dto.AttributeDTO;
import com.medvastr.backend.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/attributes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminAttributeController {

    private final AttributeService attributeService;

    @GetMapping
    public ResponseEntity<List<AttributeDTO>> getAll() {
        return ResponseEntity.ok(attributeService.getAll());
    }

    @PostMapping
    public ResponseEntity<AttributeDTO> create(@RequestBody AttributeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attributeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttributeDTO> update(@PathVariable Long id, @RequestBody AttributeDTO dto) {
        return ResponseEntity.ok(attributeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        attributeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/values")
    public ResponseEntity<AttributeDTO.AttributeValueDTO> addValue(
            @PathVariable Long id, @RequestBody AttributeDTO.AttributeValueDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attributeService.addValue(id, dto));
    }

    @DeleteMapping("/values/{valueId}")
    public ResponseEntity<Void> deleteValue(@PathVariable Long valueId) {
        attributeService.deleteValue(valueId);
        return ResponseEntity.noContent().build();
    }
}
