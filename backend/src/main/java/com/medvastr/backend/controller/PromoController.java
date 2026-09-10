package com.medvastr.backend.controller;

import com.medvastr.backend.dto.PromoCodeDTO;
import com.medvastr.backend.dto.PromoResponse;
import com.medvastr.backend.service.PromoCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/promos", "/promos"})
@RequiredArgsConstructor
public class PromoController {

    private final PromoCodeService promoCodeService;

    @GetMapping("/validate")
    public ResponseEntity<PromoResponse> validate(
            @RequestParam String code,
            @RequestParam(defaultValue = "0") Double total) {
        return ResponseEntity.ok(promoCodeService.validate(code, BigDecimal.valueOf(total)));
    }

    @GetMapping("/public/active")
    public ResponseEntity<List<PromoCodeDTO>> getActivePromos() {
        return ResponseEntity.ok(promoCodeService.getAll().stream()
                .filter(PromoCodeDTO::isActive)
                .collect(Collectors.toList()));
    }
}
