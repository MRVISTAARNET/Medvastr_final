package com.medvastr.backend.service;

import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    @Value("${whatsapp.enabled:false}")
    private boolean enabled;

    @Value("${whatsapp.api.url:}")
    private String apiUrl;

    @Value("${whatsapp.api.key:}")
    private String apiKey;

    @Value("${whatsapp.admin.numbers:}")
    private String adminNumbers;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendOrderAlerts(Order order) {
        // Build the message text
        String messageText = buildOrderMessage(order);

        // 1. Send to Customer
        String customerPhone = order.getShippingPhone() != null ? order.getShippingPhone().replaceAll("[^0-9]", "") : "";
        if (!customerPhone.isEmpty()) {
            if (customerPhone.length() == 10) {
                customerPhone = "91" + customerPhone;
            }
            sendWhatsAppMessage(customerPhone, messageText);
        }

        // 2. Send to Admins
        if (adminNumbers != null && !adminNumbers.isBlank()) {
            String[] numbers = adminNumbers.split(",");
            for (String number : numbers) {
                String cleanNum = number.trim().replaceAll("[^0-9]", "");
                if (!cleanNum.isEmpty()) {
                    if (cleanNum.length() == 10) {
                        cleanNum = "91" + cleanNum;
                    }
                    sendWhatsAppMessage(cleanNum, messageText);
                }
            }
        }
    }

    private String buildOrderMessage(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("*Medvastr Order Confirmed!* 🎉\n\n");
        sb.append("Order: #").append(order.getOrderNumber()).append("\n");
        sb.append("Name: ").append(order.getShippingName()).append("\n");
        sb.append("Total: \u20B9").append(order.getTotalAmount()).append("\n");
        sb.append("Method: ").append(order.getPaymentMethod()).append("\n\n");

        sb.append("*Items Ordered:*\n");
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                sb.append("- ")
                  .append(item.getProductName())
                  .append(" (Size: ").append(item.getSize()).append(", Qty: ").append(item.getQuantity()).append(")\n");
            }
        }

        sb.append("\n*Delivery Address:*\n");
        sb.append(order.getShippingAddress()).append(", ")
          .append(order.getShippingCity()).append(", ")
          .append(order.getShippingState()).append(" - ")
          .append(order.getShippingPincode()).append("\n");

        if (order.getTempPassword() != null && !order.getTempPassword().isEmpty()) {
            sb.append("\n*🔑 Your Account Login Details:*\n");
            sb.append("Email: ").append(order.getUser().getEmail()).append("\n");
            sb.append("Password: ").append(order.getTempPassword()).append("\n");
            sb.append("Visit: www.medvastr.com/login\n");
        }

        return sb.toString();
    }

    private void sendWhatsAppMessage(String phone, String text) {
        log.info("[WhatsApp] Message to: {}\nMessage Content:\n{}", phone, text);

        if (!enabled || apiUrl == null || apiUrl.isBlank()) {
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (apiKey != null && !apiKey.isBlank()) {
                headers.set("Authorization", "Bearer " + apiKey);
                headers.set("apikey", apiKey);
            }

            Map<String, Object> body = new HashMap<>();
            body.put("to", phone);
            body.put("message", text);
            body.put("text", text);
            body.put("recipient", phone);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            log.info("[WhatsApp] Sent to {}: Status code: {} | Response: {}", phone, response.getStatusCode(), response.getBody());
        } catch (Exception e) {
            log.error("[WhatsApp] Error sending message to {}: {}", phone, e.getMessage(), e);
        }
    }
}
