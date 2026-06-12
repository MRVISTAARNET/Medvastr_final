package com.medvastr.backend.controller;

import com.medvastr.backend.dto.AttributeDTO;
import com.medvastr.backend.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/attributes", "/attributes"})
@RequiredArgsConstructor
public class AttributeController {

    private final AttributeService attributeService;

    @GetMapping("/filters")
    public ResponseEntity<List<AttributeDTO>> getFilterableAttributes() {
        return ResponseEntity.ok(attributeService.getFilterable());
    }
}
