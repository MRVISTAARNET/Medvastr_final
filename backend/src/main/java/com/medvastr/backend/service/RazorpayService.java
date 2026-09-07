package com.medvastr.backend.service;

import com.medvastr.backend.model.StoreSetting;
import com.medvastr.backend.repository.StoreSettingRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.webhook.secret:}")
    private String webhookSecret;

    private final StoreSettingRepository storeSettingRepo;

    public RazorpayService(StoreSettingRepository storeSettingRepo) {
        this.storeSettingRepo = storeSettingRepo;
    }

    private String clean(String val) {
        if (val == null) return "";
        String cleaned = val.trim();
        if ((cleaned.startsWith("\"") && cleaned.endsWith("\"")) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            cleaned = cleaned.substring(1, cleaned.length() - 1).trim();
        }
        return cleaned;
    }

    public String getKeyId() {
        // Priority 1: Elastic Beanstalk Environment Variable directly
        String envVal = System.getenv("RAZORPAY_KEY_ID");
        if (envVal == null || envVal.isBlank()) {
            envVal = System.getenv("RAZORPAY_KEY");
        }
        if (envVal != null && !envVal.trim().isBlank()) {
            return clean(envVal);
        }

        // Priority 2: Spring Property @Value("${razorpay.key.id}")
        if (keyId != null && !keyId.trim().isBlank()) {
            return clean(keyId);
        }

        // Priority 3: Database store_setting table
        String dbVal = storeSettingRepo.findById("razorpay_key")
                .map(StoreSetting::getSettingValue)
                .orElse(null);
        if (dbVal != null && !dbVal.trim().isBlank()) {
            return clean(dbVal);
        }
        return "";
    }

    private String getDbKeySecret() {
        // Priority 1: Elastic Beanstalk Environment Variable directly
        String envVal = System.getenv("RAZORPAY_KEY_SECRET");
        if (envVal == null || envVal.isBlank()) {
            envVal = System.getenv("RAZORPAY_SECRET");
        }
        if (envVal != null && !envVal.trim().isBlank()) {
            return clean(envVal);
        }

        // Priority 2: Spring Property @Value("${razorpay.key.secret}")
        if (keySecret != null && !keySecret.trim().isBlank()) {
            return clean(keySecret);
        }

        // Priority 3: Database store_setting table
        String dbVal = storeSettingRepo.findById("razorpay_secret")
                .map(StoreSetting::getSettingValue)
                .orElse(null);
        if (dbVal != null && !dbVal.trim().isBlank()) {
            return clean(dbVal);
        }
        return "";
    }

    public RazorpayClient getClient() throws RazorpayException {
        String k = getKeyId();
        String s = getDbKeySecret();
        log.info("Resolving Razorpay Client credentials -> KeyId present: {}, Secret present: {}", !k.isBlank(), !s.isBlank());
        if (k.isBlank() || s.isBlank()) {
            throw new RazorpayException("Razorpay Key ID or Secret is not configured in Elastic Beanstalk Environment Variables (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)");
        }
        return new RazorpayClient(k, s);
    }

    public String createOrder(BigDecimal amount, String receipt) throws RazorpayException {
        String k = getKeyId();
        String s = getDbKeySecret();
        if (k.isBlank() || s.isBlank()) {
            throw new RazorpayException("Razorpay Key ID or Secret missing in Elastic Beanstalk Environment Variables (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)");
        }
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount.multiply(new BigDecimal(100)).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", receipt);
            orderRequest.put("payment_capture", 1);

            RazorpayClient client = new RazorpayClient(k, s);
            Order order = client.orders.create(orderRequest);
            log.info("Razorpay order created successfully for receipt {}", receipt);
            return order.get("id").toString();
        } catch (RazorpayException e) {
            log.error("Razorpay API Exception for receipt {}: {}", receipt, e.getMessage(), e);
            throw new RazorpayException("Razorpay API Error: " + e.getMessage());
        }
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(attributes, getDbKeySecret());
        } catch (RazorpayException e) {
            log.error("Signature verification failed for order {}", orderId);
            return false;
        }
    }

    /**
     * Fetches the live payment status from Razorpay's API.
     * Returns "captured" when money was actually received.
     * Returns "failed", "created", or other strings when payment was NOT successful.
     *
     * IMPORTANT: Signature verification alone does NOT confirm money was received.
     * A "Business – Website Mismatch" payment has a valid signature but is NEVER captured.
     * Always call this method after signature verification before marking an order PAID.
     */
    public String fetchPaymentStatus(String paymentId) {
        try {
            com.razorpay.Payment payment = getClient().payments.fetch(paymentId);
            String status = payment.get("status").toString();
            log.info("Razorpay payment {} live status: {}", paymentId, status);
            return status;
        } catch (RazorpayException e) {
            log.error("Failed to fetch payment status from Razorpay for paymentId {}: {}", paymentId, e.getMessage());
            // Fail safe: if we cannot confirm, do NOT mark as paid
            return "unknown";
        }
    }

    private String getDbWebhookSecret() {
        String dbVal = storeSettingRepo.findById("razorpay_webhook_secret")
                .map(StoreSetting::getSettingValue)
                .orElse(null);
        if (dbVal != null && !dbVal.isBlank()) {
            return dbVal.trim();
        }
        return webhookSecret != null ? webhookSecret.trim() : "";
    }

    public boolean verifyWebhookSignature(String payload, String signature) {
        String secret = getDbWebhookSecret();
        if (secret == null || secret.isBlank()) {
            log.warn("Razorpay webhook secret not configured — rejecting webhook");
            return false;
        }
        try {
            return Utils.verifyWebhookSignature(payload, signature, secret);
        } catch (RazorpayException e) {
            log.error("Webhook signature verification failed");
            return false;
        }
    }
}
