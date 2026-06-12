package com.medvastr.backend.controller;

import com.medvastr.backend.dto.PromoResponse;
import com.medvastr.backend.service.PromoCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

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
}
