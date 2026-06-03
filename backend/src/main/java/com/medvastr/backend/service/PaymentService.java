package com.medvastr.backend.service;

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
        try {
            com.razorpay.RazorpayClient client = new com.razorpay.RazorpayClient(keyId, keySecret);
            org.json.JSONObject options = new org.json.JSONObject();
            options.put("amount", (int) (Double.parseDouble(r.get("amount").toString())));
            options.put("currency", "INR");
            options.put("receipt", "txn_" + System.currentTimeMillis());

            com.razorpay.Order order = client.orders.create(options);

            return Map.of(
                    "id", order.get("id"),
                    "currency", order.get("currency"),
                    "amount", order.get("amount"),
                    "key", keyId);
        } catch (com.razorpay.RazorpayException e) {
            log.error("Razorpay Error: ", e);
            throw new RuntimeException("Could not create Razorpay order");
        }
    }

    public Map<String, String> verify(Map<String, String> p) {
        try {
            org.json.JSONObject attributes = new org.json.JSONObject();
            attributes.put("razorpay_order_id", p.get("razorpay_order_id"));
            attributes.put("razorpay_payment_id", p.get("razorpay_payment_id"));
            attributes.put("razorpay_signature", p.get("razorpay_signature"));

            boolean valid = com.razorpay.Utils.verifyPaymentSignature(attributes, keySecret);
            if (valid) {
                return Map.of("status", "verified", "message", "Payment successful");
            }
        } catch (Exception e) {
        }
        throw new RuntimeException("Invalid signature");
    }

    public void handleWebhook(String payload, String sig) {
        log.info("Razorpay webhook");
    }
}
