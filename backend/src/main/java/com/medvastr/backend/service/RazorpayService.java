package com.medvastr.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.medvastr.backend.model.StoreSetting;
import com.medvastr.backend.repository.StoreSettingRepository;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final StoreSettingRepository storeSettingRepo;

    public RazorpayService(StoreSettingRepository storeSettingRepo) {
        this.storeSettingRepo = storeSettingRepo;
    }

    private String getDbKeyId() {
        return storeSettingRepo.findById("razorpay_key").map(StoreSetting::getSettingValue).orElse(keyId);
    }

    private String getDbKeySecret() {
        return storeSettingRepo.findById("razorpay_secret").map(StoreSetting::getSettingValue).orElse(keySecret);
    }

    private RazorpayClient getClient() throws RazorpayException {
        return new RazorpayClient(getDbKeyId(), getDbKeySecret());
    }

    /**
     * Create a Razorpay Order
     * 
     * @param amount  In INR (e.g. 1099.00)
     * @param receipt Our internal order/receipt ID
     * @return Razorpay Order ID
     */
    public String createOrder(BigDecimal amount, String receipt) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        // Razorpay expects amount in paise (multiply by 100)
        orderRequest.put("amount", amount.multiply(new BigDecimal(100)).intValue());
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receipt);
        orderRequest.put("payment_capture", 1); // Auto-capture

        Order order = getClient().orders.create(orderRequest);
        return order.get("id");
    }

    /**
     * Verify Payment Signature
     */
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(attributes, getDbKeySecret());
        } catch (RazorpayException e) {
            log.error("Signature verification failed", e);
            return false;
        }
    }
}
