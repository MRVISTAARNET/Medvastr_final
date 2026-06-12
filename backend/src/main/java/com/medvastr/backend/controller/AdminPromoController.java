package com.medvastr.backend.controller;

import com.medvastr.backend.dto.PromoCodeDTO;
import com.medvastr.backend.dto.PromoCodeRequest;
import com.medvastr.backend.service.PromoCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promos")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminPromoController {

    private final PromoCodeService promoCodeService;

    @GetMapping
    public ResponseEntity<List<PromoCodeDTO>> getAll() {
        return ResponseEntity.ok(promoCodeService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromoCodeDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(promoCodeService.getById(id));
    }

    @PostMapping
    public ResponseEntity<PromoCodeDTO> create(@RequestBody PromoCodeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promoCodeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromoCodeDTO> update(@PathVariable Long id, @RequestBody PromoCodeRequest request) {
        return ResponseEntity.ok(promoCodeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promoCodeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
