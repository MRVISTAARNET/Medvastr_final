package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService s;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, Object> r) {
        return ResponseEntity.ok(ApiResponse.ok("Created", s.createOrder(r)));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, String>>> verify(@RequestBody Map<String, String> p) {
        return ResponseEntity.ok(ApiResponse.ok("Verified", s.verify(p)));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> hook(
            @RequestBody String p,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String sig) {
        if (sig == null || sig.isBlank()) {
            return ResponseEntity.status(401).body("Missing signature");
        }
        try {
            s.handleWebhook(p, sig);
            return ResponseEntity.ok("OK");
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body("Invalid webhook");
        }
    }
}
