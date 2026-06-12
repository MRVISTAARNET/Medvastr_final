package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ColorDTO;
import com.medvastr.backend.service.ColorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/colors", "/colors"})
@RequiredArgsConstructor
public class ColorController {

    private final ColorService colorService;

    @GetMapping
    public ResponseEntity<List<ColorDTO>> getActiveColors() {
        return ResponseEntity.ok(colorService.getActive());
    }
}
