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

    @Value("${whatsapp.admin.numbers:}")
    private String adminNumbers;

    private final com.medvastr.backend.repository.ProductRepository productRepo;
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

        String featuredProductImg = null;
        if (productRepo != null) {
            try {
                var scrubProducts = productRepo.findActiveWithImagesByKeyword("scrub", org.springframework.data.domain.PageRequest.of(0, 10));
                java.util.List<String> allImages = new java.util.ArrayList<>();
                for (var p : scrubProducts) {
                    if (p != null && p.getImages() != null && !p.getImages().isEmpty()) {
                        for (var img : p.getImages()) {
                            if (img != null && img.getImageUrl() != null && !img.getImageUrl().isBlank()) {
                                String normalized = normalizeImageUrl(img.getImageUrl());
                                if (normalized != null && !normalized.isBlank()) {
                                    allImages.add(normalized);
                                }
                            }
                        }
                    }
                }
                if (!allImages.isEmpty()) {
                    int randomIndex = java.util.concurrent.ThreadLocalRandom.current().nextInt(allImages.size());
                    featuredProductImg = allImages.get(randomIndex);
                    log.info("[WhatsApp] Dynamically selected catalog product image ({}/{}): {}", randomIndex + 1, allImages.size(), featuredProductImg);
                }
            } catch (Exception e) {
                log.warn("Could not fetch scrub suit image for WhatsApp alert: {}", e.getMessage());
            }
        }

        sendWhatsAppWelcomeTemplate(cleanPhone, displayName, featuredProductImg);
    }

    public void sendWhatsAppWelcomeTemplate(String phone, String displayName, String imageUrl) {
        if (!enabled) return;
        String effectiveKey = (apiKey != null && !apiKey.isBlank()) ? apiKey : msg91AuthKey;
        if (effectiveKey == null || effectiveKey.isBlank()) return;

        log.info("[WhatsApp] Triggering welcome offer template for {}", maskPhone(phone));

        // 1. Try Bulk Template API with "en"
        boolean success = sendBulkTemplateApi(phone, displayName, imageUrl, effectiveKey, "en");
        if (!success) {
            log.info("[WhatsApp] Retrying Bulk API with language code en_US for {}", maskPhone(phone));
            success = sendBulkTemplateApi(phone, displayName, imageUrl, effectiveKey, "en_US");
        }

        // 2. Fallback to Simple Template API with "en" then "en_US"
        if (!success) {
            log.info("[WhatsApp] Retrying via MSG91 Simple Template API (en) for {}", maskPhone(phone));
            success = sendSimpleTemplateApi(phone, displayName, imageUrl, effectiveKey, "en");
        }
        if (!success) {
            log.info("[WhatsApp] Retrying via MSG91 Simple Template API (en_US) for {}", maskPhone(phone));
            sendSimpleTemplateApi(phone, displayName, imageUrl, effectiveKey, "en_US");
        }
    }

    private boolean sendBulkTemplateApi(String phone, String displayName, String imageUrl, String effectiveKey, String langCode) {
        String bulkUrl = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authkey", effectiveKey);

            String effectiveHeaderImg = (imageUrl != null && !imageUrl.isBlank())
                    ? imageUrl
                    : "https://d2tnzshqdaedbc.cloudfront.net/home-hero-1.jpg";

            Map<String, Object> body = new HashMap<>();
            body.put("integrated_number", "918976488911");
            body.put("content_type", "template");

            Map<String, Object> templateObj = new HashMap<>();
            templateObj.put("name", "welcome_offer_10");
            templateObj.put("language", Map.of("code", langCode, "policy", "deterministic"));
            templateObj.put("namespace", "a5a9be9d_7395_44c6_9c08_9592d1afefdf");

            Map<String, Object> header1 = Map.of("type", "image", "value", effectiveHeaderImg);
            Map<String, Object> body1 = Map.of("type", "text", "value", displayName);

            Map<String, Object> components = Map.of("header_1", header1, "body_1", body1);

            Map<String, Object> toComp = new HashMap<>();
            toComp.put("to", java.util.List.of(phone));
            toComp.put("components", components);

            templateObj.put("to_and_components", java.util.List.of(toComp));

            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("type", "template");
            payload.put("template", templateObj);

            body.put("payload", payload);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(bulkUrl, entity, String.class);
            log.info("[WhatsApp Bulk API] Sent ({}) to {}: Status: {} | Response: {}", langCode, maskPhone(phone), response.getStatusCode(), response.getBody());

            String resBody = response.getBody();
            if (resBody != null && (resBody.contains("\"hasError\":true") || resBody.contains("does not exist") || resBody.contains("\"status\":\"error\""))) {
                return false;
            }
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("[WhatsApp Bulk API] Error sending ({}) to {}: {}", langCode, maskPhone(phone), e.getMessage());
            return false;
        }
    }

    private boolean sendSimpleTemplateApi(String phone, String displayName, String imageUrl, String effectiveKey, String langCode) {
        String simpleUrl = "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authkey", effectiveKey);

            String effectiveHeaderImg = (imageUrl != null && !imageUrl.isBlank())
                    ? imageUrl
                    : "https://d2tnzshqdaedbc.cloudfront.net/home-hero-1.jpg";

            Map<String, Object> body = new HashMap<>();
            body.put("integrated_number", "918976488911");
            body.put("content_type", "template");
            body.put("template_name", "welcome_offer_10");
            body.put("language", langCode);
            body.put("to", phone);
            body.put("recipient", phone);

            Map<String, String> headerMap = new HashMap<>();
            headerMap.put("type", "image");
            headerMap.put("url", effectiveHeaderImg);
            body.put("header", headerMap);

            Map<String, String> bodyVars = new HashMap<>();
            bodyVars.put("1", displayName);
            body.put("body", bodyVars);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(simpleUrl, entity, String.class);
            log.info("[WhatsApp Simple API] Sent ({}) to {}: Status: {} | Response: {}", langCode, maskPhone(phone), response.getStatusCode(), response.getBody());

            String resBody = response.getBody();
            if (resBody != null && (resBody.contains("\"hasError\":true") || resBody.contains("does not exist") || resBody.contains("\"status\":\"error\""))) {
                return false;
            }
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.error("[WhatsApp Simple API] Error sending ({}) to {}: {}", langCode, maskPhone(phone), e.getMessage());
            return false;
        }
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return "*".repeat(phone.length() - 4) + phone.substring(phone.length() - 4);
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
        sendWhatsAppMessageWithMedia(phone, text, null);
    }

    private void sendWhatsAppMessageWithMedia(String phone, String text, String imageUrl) {
        log.info("[WhatsApp] Outbound message request to: {} | Media Image: {}", maskPhone(phone), imageUrl);

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

            String senderNum = "918976488911";
            if (adminNumbers != null && !adminNumbers.isBlank()) {
                String cleanAdmin = adminNumbers.split(",")[0].trim().replaceAll("[^0-9]", "");
                if (cleanAdmin.length() == 10) cleanAdmin = "91" + cleanAdmin;
                if (!cleanAdmin.isEmpty()) senderNum = cleanAdmin;
            }

            Map<String, Object> body = new HashMap<>();
            body.put("integrated_number", senderNum);
            body.put("integratedNumber", senderNum);
            body.put("sender", senderNum);
            body.put("from", senderNum);
            body.put("content_type", "text");
            body.put("contentType", "text");
            body.put("content-type", "text");
            body.put("to", phone);
            body.put("recipient_number", phone);
            body.put("recipient_numbers", phone);
            body.put("recipientNumber", phone);
            body.put("to_number", phone);
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

            log.info("[WhatsApp] Message sent to {}: Status: {}", maskPhone(phone), response.getStatusCode());
        } catch (Exception e) {
            log.error("[WhatsApp] Error sending message to {}: {}", maskPhone(phone), e.getMessage());
        }
    }
}
