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

    public String getKeyId() {
        return storeSettingRepo.findById("razorpay_key").map(StoreSetting::getSettingValue).orElse(keyId);
    }

    private String getDbKeySecret() {
        return storeSettingRepo.findById("razorpay_secret").map(StoreSetting::getSettingValue).orElse(keySecret);
    }

    public RazorpayClient getClient() throws RazorpayException {
        return new RazorpayClient(getKeyId(), getDbKeySecret());
    }

    public String createOrder(BigDecimal amount, String receipt) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount.multiply(new BigDecimal(100)).intValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receipt);
        orderRequest.put("payment_capture", 1);

        Order order = getClient().orders.create(orderRequest);
        log.info("Razorpay order created for receipt {}", receipt);
        return order.get("id").toString();
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

    private String getDbWebhookSecret() {
        return storeSettingRepo.findById("razorpay_webhook_secret").map(StoreSetting::getSettingValue).orElse(webhookSecret);
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
