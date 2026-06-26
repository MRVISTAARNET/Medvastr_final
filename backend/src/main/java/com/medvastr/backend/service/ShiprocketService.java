package com.medvastr.backend.service;

import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderItem;
import com.medvastr.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;
import org.springframework.transaction.annotation.Transactional;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShiprocketService {
    private final OrderRepository orderRepository;

    @Value("${shiprocket.enabled:false}")
    private boolean enabled;

    @Value("${shiprocket.email:}")
    private String email;

    @Value("${shiprocket.password:}")
    private String password;

    @Value("${shiprocket.pickup_location:Primary}")
    private String pickupLocation;

    private final RestTemplate restTemplate = new RestTemplate();

    // Thread-safe token storage with expiry
    private static class TokenData {
        String token;
        long expiryTime;

        TokenData(String token, long ttlMillis) {
            this.token = token;
            this.expiryTime = System.currentTimeMillis() + ttlMillis;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }

    private final ConcurrentHashMap<String, TokenData> tokenCache = new ConcurrentHashMap<>();
    private static final String TOKEN_CACHE_KEY = "shiprocket_token";
    private static final long TOKEN_TTL_MILLIS = 24 * 60 * 60 * 1000; // 24 hours

    @PostConstruct
    public void testAuth() {
        log.info("========== SHIPROCKET DIAGNOSTICS ==========");
        if (!enabled) {
            log.info("Shiprocket Service: DISABLED");
            log.info("============================================");
            return;
        }
        log.info("Shiprocket Service: ENABLED");
        String maskedEmail = (email != null && email.length() > 3) ? email.substring(0, 3) + "****" : "NOT SET";
        log.info("Shiprocket Email: {}", maskedEmail);
        log.info("Attempting startup auth test...");
        try {
            String token = login();
            if (token != null) {
                log.info("Startup Auth Test: SUCCESS");
            } else {
                log.error("Startup Auth Test: FAILED (Check credentials!)");
            }
        } catch (Exception e) {
            log.error("Startup Auth Test: EXCEPTION - {}", e.getMessage());
        }
        log.info("============================================");
    }

    private synchronized String getValidToken() throws Exception {
        TokenData cached = tokenCache.get(TOKEN_CACHE_KEY);

        // Return cached token if still valid
        if (cached != null && !cached.isExpired()) {
            log.debug("[Shiprocket] Using cached token");
            return cached.token;
        }

        // Login and get new token
        String newToken = login();
        if (newToken != null) {
            tokenCache.put(TOKEN_CACHE_KEY, new TokenData(newToken, TOKEN_TTL_MILLIS));
            return newToken;
        }

        throw new Exception("Failed to authenticate with Shiprocket");
    }

    private String login() {
        try {
            Map<String, String> body = new HashMap<>();
            body.put("email", email);
            body.put("password", password);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "Mozilla/5.0");
            headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> res = restTemplate.postForEntity(
                    "https://apiv2.shiprocket.in/v1/external/auth/login",
                    entity,
                    String.class);

            log.info("[Shiprocket] Login Response Status: {}", res.getStatusCode());

            if (res.getStatusCode() == HttpStatus.OK && res.getBody() != null) {
                JSONObject json = new JSONObject(res.getBody());
                String token = json.optString("token");
                if (!token.isEmpty()) {
                    log.info("[Shiprocket] Successfully authenticated");
                    return token;
                }
            }

            log.error("[Shiprocket] Login failed with status: {} - {}", res.getStatusCode(), res.getBody());
            return null;
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("[Shiprocket] Login API Error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            log.error("[Shiprocket] Login exception: {}", e.getMessage());
            return null;
        }
    }

    @Async
    public void createOrder(Order order) {
        if (!enabled) {
            log.debug("[Shiprocket] Service disabled");
            return;
        }

        try {
            String token = getValidToken();
            if (token == null) {
                log.error("[Shiprocket] Cannot push order {} - Failed to get token", order.getOrderNumber());
                return;
            }

            pushOrderToShiprocket(order, token);
        } catch (Exception e) {
            log.error("[Shiprocket] Error creating order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    private void pushOrderToShiprocket(Order order, String token) {
        try {
            JSONObject shipOrder = buildShiprocketOrderJson(order);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            HttpEntity<String> entity = new HttpEntity<>(shipOrder.toString(), headers);

            log.info("[Shiprocket] Request payload: {}", shipOrder.toString());
            ResponseEntity<String> res = restTemplate.postForEntity(
                    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
                    entity,
                    String.class);

            log.info("[Shiprocket] Response for {}: {} - {}", order.getOrderNumber(), res.getStatusCode(), res.getBody());

            if (res.getStatusCode() == HttpStatus.OK || res.getStatusCode() == HttpStatus.CREATED) {
                log.info("[Shiprocket] Order pushed successfully: {}", order.getOrderNumber());
                try {
                    JSONObject resJson = new JSONObject(res.getBody());
                    String awb = resJson.optString("awb_code");
                    String courier = resJson.optString("courier_name");
                    long shipmentId = resJson.optLong("shipment_id", 0);
                    log.info("[Shiprocket] Shipment ID: {}, AWB: {}, Courier: {}", shipmentId, awb, courier);
                    
                    boolean updated = false;
                    if (awb != null && !awb.isEmpty() && !awb.equals("null")) {
                        order.setTrackingNumber(awb);
                        updated = true;
                    }
                    if (courier != null && !courier.isEmpty() && !courier.equals("null")) {
                        order.setCourierName(courier);
                        updated = true;
                    }
                    if (updated) {
                        orderRepository.save(order);
                    }
                } catch (Exception parseEx) {
                    log.warn("[Shiprocket] Failed to parse success response: {}", parseEx.getMessage());
                }
            } else {
                log.error("[Shiprocket] Failed to push order {}: {}", order.getOrderNumber(), res.getBody());
            }

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("[Shiprocket] API error for {}: {} - {}", order.getOrderNumber(), e.getStatusCode(),
                    e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401) {
                // Token expired, clear cache to force re-login
                tokenCache.remove(TOKEN_CACHE_KEY);
            }
        } catch (Exception e) {
            log.error("[Shiprocket] Error pushing order {}: {}", order.getOrderNumber(), e.getMessage());
            log.error("[Shiprocket] Exception trace: ", e);
        }
    }

    private JSONObject buildShiprocketOrderJson(Order order) {
        JSONObject shipOrder = new JSONObject();
        shipOrder.put("order_id", order.getOrderNumber());
        shipOrder.put("order_date",
                order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        shipOrder.put("pickup_location", pickupLocation);
        shipOrder.put("channel_id", "");
        shipOrder.put("comment", order.getNotes() != null ? order.getNotes() : "E-commerce Order");

        // Parse customer name safely
        String fullName = order.getShippingName() != null ? order.getShippingName().trim() : "Customer";
        if (fullName.isEmpty()) fullName = "Customer";
        String[] names = fullName.split("\\s+");
        shipOrder.put("billing_customer_name", names[0].replaceAll("[^a-zA-Z0-9 ]", ""));
        shipOrder.put("billing_last_name", names.length > 1 ? names[names.length - 1].replaceAll("[^a-zA-Z0-9 ]", "") : names[0].replaceAll("[^a-zA-Z0-9 ]", ""));

        String address = order.getShippingAddress() != null ? order.getShippingAddress().trim() : "Medvastr Address";
        if (address.length() < 10) {
            address = address + " (Additional Address Info)";
        }
        shipOrder.put("billing_address", address);
        shipOrder.put("billing_city", order.getShippingCity() != null ? order.getShippingCity() : "Mumbai");
        shipOrder.put("billing_pincode",
                order.getShippingPincode() != null ? order.getShippingPincode().replaceAll("[^0-9]", "") : "400063");
        shipOrder.put("billing_state", order.getShippingState() != null ? order.getShippingState() : "Maharashtra");
        shipOrder.put("billing_country", "India");
        shipOrder.put("billing_email", order.getUser() != null ? order.getUser().getEmail() : "customer@medvastr.com");
        
        String phone = order.getShippingPhone() != null ? order.getShippingPhone().replaceAll("[^0-9]", "") : "9999999999";
        if (phone.length() < 10) phone = "9999999999";
        if (phone.length() > 10) phone = phone.substring(phone.length() - 10);
        shipOrder.put("billing_phone", phone);

        shipOrder.put("shipping_is_billing", true);

        JSONArray items = new JSONArray();
        double totalWeight = 0;

        for (OrderItem oi : order.getItems()) {
            JSONObject item = new JSONObject();
            item.put("name", oi.getProductName());
            item.put("sku", oi.getVariant() != null && oi.getVariant().getSku() != null ? oi.getVariant().getSku()
                    : (oi.getProduct() != null && oi.getProduct().getSku() != null ? oi.getProduct().getSku()
                    : "SKU-" + order.getOrderNumber() + "-" + (items.length() + 1)));
            item.put("units", oi.getQuantity());
            item.put("selling_price", oi.getUnitPrice().toString());
            item.put("discount", "");
            item.put("tax", "");
            item.put("hsn", "");
            items.put(item);

            double w = 0.5;
            try {
                String ws = oi.getProduct() != null ? oi.getProduct().getWeight() : null;
                if (ws != null && !ws.isEmpty()) {
                    double num = Double.parseDouble(ws.replaceAll("[^0-9.]", ""));
                    String lower = ws.toLowerCase();
                    if (lower.contains("kg")) {
                        w = num;
                    } else if (lower.contains("g") || lower.contains("gm")) {
                        w = num / 1000.0;
                    } else {
                        w = num < 10 ? num : num / 1000.0;
                    }
                }
            } catch (Exception e) {
                log.debug("Weight parse error: {}", e.getMessage());
            }
            totalWeight += (w * oi.getQuantity());
        }

        shipOrder.put("order_items", items);
        shipOrder.put("payment_method", order.getPaymentMethod().name().equals("COD") ? "COD" : "Prepaid");
        shipOrder.put("sub_total", order.getTotalAmount().doubleValue());

        shipOrder.put("length", 15);
        shipOrder.put("breadth", 15);
        shipOrder.put("height", 10);
        shipOrder.put("weight", totalWeight > 0 ? totalWeight : 0.5);

        return shipOrder;
    }

    // Public method for debugging - fetch available pickup locations
    public String getPickupLocations() {
        try {
            String token = getValidToken();
            if (token == null) {
                return "Failed to get authentication token";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> res = restTemplate.exchange(
                    "https://apiv2.shiprocket.in/v1/external/settings/get/pickup",
                    HttpMethod.GET,
                    entity,
                    String.class);

            log.info("[Shiprocket] Available Pickup Locations: {}", res.getBody());
            return res.getBody();
        } catch (Exception e) {
            log.error("[Shiprocket] Error fetching locations: {}", e.getMessage());
            return "Error: " + e.getMessage();
        }
    }

    @Transactional
    public void handleWebhook(String payload) {
        JSONObject json = new JSONObject(payload);
        String orderId = json.optString("order_id");
        String status = json.optString("status");
        String awb = json.optString("awb");
        String courier = json.optString("courier_name");

        if (orderId == null || orderId.isEmpty()) {
            log.warn("[Shiprocket Webhook] Missing order_id in payload");
            return;
        }

        orderRepository.findByOrderNumber(orderId).ifPresent(order -> {
            log.info("[Shiprocket Webhook] Updating order {} to status: {}", orderId, status);

            if (awb != null && !awb.isEmpty()) {
                order.setTrackingNumber(awb);
            }
            if (courier != null && !courier.isEmpty()) {
                order.setCourierName(courier);
            }

            // Map Shiprocket status to internal status
            updateOrderStatusMapping(order, status);

            orderRepository.save(order);
        });
    }

    private void updateOrderStatusMapping(Order order, String shiprocketStatus) {
        if (shiprocketStatus == null)
            return;

        String s = shiprocketStatus.toLowerCase();
        if (s.contains("shipped")) {
            order.setStatus(Order.OrderStatus.SHIPPED);
        } else if (s.contains("delivered")) {
            order.setStatus(Order.OrderStatus.DELIVERED);
            order.setDeliveredAt(java.time.LocalDateTime.now());
        } else if (s.contains("cancelled")) {
            order.setStatus(Order.OrderStatus.CANCELLED);
        } else if (s.contains("out for delivery")) {
            order.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
        } else if (s.contains("return")) {
            order.setStatus(Order.OrderStatus.RETURNED);
        }
    }

    public String getServiceability(String deliveryPincode, double weight, boolean isCod) {
        try {
            String token = getValidToken();
            if (token == null) return "{\"success\": false, \"message\": \"Authentication failed\"}";

            String url = String.format("https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=400063&delivery_postcode=%s&weight=%s&cod=%d",
                    deliveryPincode, weight, isCod ? 1 : 0);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return res.getBody();
        } catch (Exception e) {
            log.error("[Shiprocket] Serviceability error for {}: {}", deliveryPincode, e.getMessage());
            return "{\"success\": false, \"message\": \"" + e.getMessage() + "\"}";
        }
    }

    public String getTrackingDetails(String awb) {
        try {
            String token = getValidToken();
            if (token == null) return "{\"success\": false, \"message\": \"Authentication failed\"}";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> res = restTemplate.exchange(
                    "https://apiv2.shiprocket.in/v1/external/courier/track/awb/" + awb,
                    HttpMethod.GET, entity, String.class);
            return res.getBody();
        } catch (Exception e) {
            log.error("[Shiprocket] Tracking error for AWB {}: {}", awb, e.getMessage());
            return "{\"success\": false, \"message\": \"" + e.getMessage() + "\"}";
        }
    }
}
