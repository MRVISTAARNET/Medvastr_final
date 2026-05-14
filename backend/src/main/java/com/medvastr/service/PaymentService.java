package com.medvastr.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class PaymentService {
    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public Map<String, Object> createOrder(Map<String, Object> r) {
        log.info("Razorpay order: {}", r.get("amount"));
        return Map.of(
            "id", "order_" + System.currentTimeMillis(),
            "currency", "INR",
            "amount", r.get("amount"),
            "key", keyId
        );
    }

    public Map<String, String> verify(Map<String, String> p) {
        return Map.of("status", "verified", "message", "Payment verified");
    }

    public void handleWebhook(String payload, String sig) {
        log.info("Razorpay webhook");
    }
}

