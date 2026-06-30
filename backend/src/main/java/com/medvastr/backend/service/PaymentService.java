package com.medvastr.backend.service;

import com.medvastr.backend.model.Order;
import com.medvastr.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final RazorpayService razorpayService;
    private final OrderRepository orderRepository;
    private final EmailService emailService;
    private final ShiprocketService shiprocketService;
    private final WhatsAppService whatsAppService;

    public Map<String, Object> createOrder(Map<String, Object> r) {
        try {
            com.razorpay.RazorpayClient client = razorpayService.getClient();
            JSONObject options = new JSONObject();
            options.put("amount", (int) Double.parseDouble(r.get("amount").toString()));
            options.put("currency", "INR");
            options.put("receipt", "txn_" + System.currentTimeMillis());

            com.razorpay.Order order = client.orders.create(options);

            return Map.of(
                    "id", order.get("id"),
                    "currency", order.get("currency"),
                    "amount", order.get("amount"),
                    "key", razorpayService.getKeyId());
        } catch (Exception e) {
            log.error("Razorpay order creation failed", e);
            throw new RuntimeException("Could not create Razorpay order");
        }
    }

    public Map<String, String> verify(Map<String, String> p) {
        boolean valid = razorpayService.verifySignature(
                p.get("razorpay_order_id"),
                p.get("razorpay_payment_id"),
                p.get("razorpay_signature"));
        if (valid) {
            return Map.of("status", "verified", "message", "Payment successful");
        }
        throw new RuntimeException("Invalid signature");
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (!razorpayService.verifyWebhookSignature(payload, signature)) {
            log.warn("Rejected Razorpay webhook — invalid signature");
            throw new RuntimeException("Invalid webhook signature");
        }

        JSONObject event = new JSONObject(payload);
        String eventType = event.optString("event");
        log.info("Razorpay webhook received: {}", eventType);

        if ("payment.captured".equals(eventType)) {
            JSONObject payment = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            String razorpayOrderId = payment.optString("order_id");
            String paymentId = payment.optString("id");

            orderRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(order -> {
                if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
                    log.info("Webhook ignored — order {} already paid", order.getOrderNumber());
                    return;
                }
                order.setPaymentStatus(Order.PaymentStatus.PAID);
                order.setStatus(Order.OrderStatus.CONFIRMED);
                order.setPaymentId(paymentId);
                Order saved = orderRepository.save(order);
                preloadOrderRelations(saved);
                triggerAsyncPostCommitActions(saved);
            });
        }
    }

    private void preloadOrderRelations(Order order) {
        if (order.getItems() != null) {
            order.getItems().forEach(i -> {
                if (i.getProduct() != null) {
                    i.getProduct().getName();
                }
                if (i.getVariant() != null) {
                    i.getVariant().getSku();
                }
            });
        }
        if (order.getUser() != null) {
            order.getUser().getEmail();
        }
    }

    private void triggerAsyncPostCommitActions(Order order) {
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            emailService.sendOrderConfirmationEmail(order);
                            emailService.sendAdminNotification(order);
                            whatsAppService.sendOrderAlerts(order);
                            shiprocketService.createOrder(order.getId());
                        } catch (Exception e) {
                            log.error("Failed to run async post-commit actions", e);
                        }
                    }
                }
            );
        } else {
            emailService.sendOrderConfirmationEmail(order);
            emailService.sendAdminNotification(order);
            whatsAppService.sendOrderAlerts(order);
            shiprocketService.createOrder(order.getId());
        }
    }
}
