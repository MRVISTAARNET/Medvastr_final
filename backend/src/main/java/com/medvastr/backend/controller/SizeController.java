package com.medvastr.backend.controller;

import com.medvastr.backend.dto.SizeDTO;
import com.medvastr.backend.service.SizeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/sizes", "/sizes"})
@RequiredArgsConstructor
public class SizeController {

    private final SizeService sizeService;

    @GetMapping
    public ResponseEntity<List<SizeDTO>> getActiveSizes() {
        return ResponseEntity.ok(sizeService.getActive());
    }
}
