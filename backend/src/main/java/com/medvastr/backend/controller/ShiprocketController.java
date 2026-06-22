package com.medvastr.backend.controller;

import com.medvastr.backend.service.ShiprocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
@Slf4j
public class ShiprocketController {

    private final ShiprocketService shiprocketService;

    @PostMapping("/updates")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "x-api-key", required = false) String apiKey) {

        log.info("Received Shiprocket webhook payload: {}", payload);

        // You can add validation for apiKey if you configure one in Shiprocket
        // dashboard
        try {
            shiprocketService.handleWebhook(payload);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Error processing Shiprocket webhook", e);
            return ResponseEntity.status(500).body("Error");
        }
    }
}
