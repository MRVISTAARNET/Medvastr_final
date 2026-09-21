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

    @Value("${whatsapp.enabled:true}")
    private boolean enabled;

    @Value("${whatsapp.api.url:}")
    private String apiUrl;

    @Value("${whatsapp.api.key:}")
    private String apiKey;

    @Value("${msg91.authkey:}")
    private String msg91AuthKey;

    @Value("${whatsapp.admin.numbers:8976488911}")
    private String adminNumbers;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendOrderAlerts(Order order) {
        // Build the message text
        String messageText = buildOrderMessage(order);

        String firstProductImg = getFirstProductImageUrl(order);

        // 1. Send to Customer
        String customerPhone = order.getShippingPhone() != null ? order.getShippingPhone().replaceAll("[^0-9]", "") : "";
        if (!customerPhone.isEmpty()) {
            if (customerPhone.length() == 10) {
                customerPhone = "91" + customerPhone;
            }
            sendWhatsAppMessageWithMedia(customerPhone, messageText, firstProductImg);
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
                    sendWhatsAppMessageWithMedia(cleanNum, messageText, firstProductImg);
                }
            }
        }
    }

    private String getFirstProductImageUrl(Order order) {
        String defaultImg = "https://d2tnzshqdaedbc.cloudfront.net/home-hero-1.jpg";
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return defaultImg;
        }
        for (OrderItem item : order.getItems()) {
            String resolved = resolveItemImageUrl(item);
            if (resolved != null && !resolved.isBlank()) {
                return resolved;
            }
        }
        return defaultImg;
    }

    private String resolveItemImageUrl(OrderItem item) {
        if (item == null) return null;
        String img = null;
        if (item.getVariant() != null && item.getVariant().getImageUrl() != null && !item.getVariant().getImageUrl().isBlank()) {
            img = item.getVariant().getImageUrl();
        } else if (item.getProduct() != null && item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
            img = item.getProduct().getImages().stream()
                    .map(com.medvastr.backend.model.ProductImage::getImageUrl)
                    .filter(i -> i != null && !i.isBlank())
                    .findFirst().orElse(null);
        }
        return normalizeImageUrl(img);
    }

    private String normalizeImageUrl(String url) {
        if (url == null || url.isBlank()) return null;
        String clean = url.trim();
        if (clean.contains("api.medvastr.com")) {
            clean = clean.replace("http://api.medvastr.com", "https://api.medvarn.com")
                         .replace("https://api.medvastr.com", "https://api.medvarn.com");
        }
        if (clean.startsWith("/")) {
            clean = "https://api.medvarn.com" + clean;
        } else if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
            clean = "https://api.medvarn.com/" + clean;
        }
        return clean;
    }

    @Async
    public void sendWelcomeLeadAlert(String phone, String name) {
        if (phone == null || phone.isBlank()) return;
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        if (cleanPhone.length() == 10) {
            cleanPhone = "91" + cleanPhone;
        }
        if (!cleanPhone.startsWith("91") || cleanPhone.length() != 12) return;

        String displayName = (name != null && !name.isBlank()) ? name : "Customer";
        StringBuilder sb = new StringBuilder();
        sb.append("*Welcome to Medvarn!* 🎉\n\n");
        sb.append("Hi ").append(displayName).append(", thank you for joining us!\n\n");
        sb.append("Here is your exclusive 10% OFF discount coupon code:\n");
        sb.append("🏷️ *WELCOME10*\n\n");
        sb.append("Use code *WELCOME10* at checkout on www.medvarn.com to save 10% on your Scrub Suits order!\n\n");
        sb.append("Need assistance with sizing or fabric choices? Reply to this message anytime! 🩺");

        String featuredProductImg = "https://d2tnzshqdaedbc.cloudfront.net/home-hero-1.jpg";
        sendWhatsAppMessageWithMedia(cleanPhone, sb.toString(), featuredProductImg);
    }

    private String buildOrderMessage(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("*Medvarn Order Confirmed!* 🎉\n\n");
        sb.append("Order: #").append(order.getOrderNumber()).append("\n");
        sb.append("Name: ").append(order.getShippingName()).append("\n");
        sb.append("Total: \u20B9").append(order.getTotalAmount()).append("\n");
        sb.append("Method: ").append(order.getPaymentMethod()).append("\n\n");

        sb.append("*Items Ordered:*\n");
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                sb.append("• ").append(item.getProductName())
                  .append(" (Size: ").append(item.getSize() != null ? item.getSize() : "Standard")
                  .append(", Qty: ").append(item.getQuantity()).append(")\n");
                
                String itemImg = resolveItemImageUrl(item);
                if (itemImg != null && !itemImg.isBlank()) {
                    sb.append("  🖼️ Image: ").append(itemImg).append("\n");
                }
            }
        }

        sb.append("\n*Delivery Address:*\n");
        sb.append(order.getShippingAddress()).append(", ")
          .append(order.getShippingCity()).append(", ")
          .append(order.getShippingState()).append(" - ")
          .append(order.getShippingPincode()).append("\n");

        if (order.getTempPassword() != null && !order.getTempPassword().isEmpty()) {
            sb.append("\n*🔑 Your Account Login Details:*\n");
            sb.append("Email: ").append(order.getUser() != null && order.getUser().getEmail() != null ? order.getUser().getEmail() : "N/A").append("\n");
            sb.append("Password: ").append(order.getTempPassword()).append("\n");
            sb.append("Visit: www.medvarn.com/login\n");
        }

        return sb.toString();
    }

    private void sendWhatsAppMessage(String phone, String text) {
        sendWhatsAppMessageWithMedia(phone, text, "https://d2tnzshqdaedbc.cloudfront.net/home-hero-1.jpg");
    }

    private void sendWhatsAppMessageWithMedia(String phone, String text, String imageUrl) {
        log.info("[WhatsApp] Media Message request to: {}\nImage: {}\nContent:\n{}", phone, imageUrl, text);

        if (!enabled) {
            log.info("[WhatsApp] Service disabled (whatsapp.enabled=false)");
            return;
        }

        String effectiveKey = (apiKey != null && !apiKey.isBlank()) ? apiKey : msg91AuthKey;
        String targetUrl = apiUrl;
        if (targetUrl == null || targetUrl.isBlank()) {
            if (effectiveKey != null && !effectiveKey.isBlank()) {
                targetUrl = "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";
            }
        }

        if (targetUrl == null || targetUrl.isBlank() || effectiveKey == null || effectiveKey.isBlank()) {
            log.warn("[WhatsApp] Cannot send WhatsApp message. Neither WHATSAPP_API_URL nor MSG91_AUTHKEY is configured.");
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + effectiveKey);
            headers.set("authkey", effectiveKey);
            headers.set("apikey", effectiveKey);

            Map<String, Object> body = new HashMap<>();
            body.put("to", phone);
            body.put("message", text);
            body.put("text", text);
            body.put("caption", text);
            body.put("recipient", phone);

            if (imageUrl != null && !imageUrl.isBlank()) {
                body.put("image", imageUrl);
                body.put("imageUrl", imageUrl);
                body.put("image_url", imageUrl);
                body.put("mediaUrl", imageUrl);
                body.put("media_url", imageUrl);

                Map<String, String> mediaMap = new HashMap<>();
                mediaMap.put("type", "image");
                mediaMap.put("url", imageUrl);
                body.put("media", mediaMap);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(targetUrl, entity, String.class);

            log.info("[WhatsApp] Sent Media Message to {}: Status code: {} | Response: {}", phone, response.getStatusCode(), response.getBody());
        } catch (Exception e) {
            log.error("[WhatsApp] Error sending media message to {}: {}", phone, e.getMessage(), e);
        }
    }
}
