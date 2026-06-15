package com.medvastr.backend.service;

import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;
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
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShiprocketService {

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

            ResponseEntity<String> res = restTemplate.postForEntity(
                    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
                    entity,
                    String.class);

            log.info("[Shiprocket] Response for {}: {} - {}", order.getOrderNumber(), res.getStatusCode(),
                    res.getBody());

            if (res.getStatusCode() == HttpStatus.OK || res.getStatusCode() == HttpStatus.CREATED) {
                log.info("[Shiprocket] Order pushed successfully: {}", order.getOrderNumber());
            } else {
                log.warn("[Shiprocket] Failed to push order {}: {}", order.getOrderNumber(), res.getBody());
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
        String fullName = order.getShippingName() != null ? order.getShippingName() : "Customer";
        String[] names = fullName.trim().split("\\s+");
        shipOrder.put("billing_customer_name", names[0]);
        shipOrder.put("billing_last_name", names.length > 1 ? names[names.length - 1] : ".");

        shipOrder.put("billing_address", order.getShippingAddress());
        shipOrder.put("billing_city", order.getShippingCity());
        shipOrder.put("billing_pincode",
                order.getShippingPincode() != null ? order.getShippingPincode().replaceAll("[^0-9]", "") : "");
        shipOrder.put("billing_state", order.getShippingState());
        shipOrder.put("billing_country", "India");
        shipOrder.put("billing_email", order.getUser().getEmail());
        shipOrder.put("billing_phone", order.getShippingPhone());

        shipOrder.put("shipping_is_billing", true);

        JSONArray items = new JSONArray();
        double totalWeight = 0;

        for (OrderItem oi : order.getItems()) {
            JSONObject item = new JSONObject();
            item.put("name", oi.getProductName());
            item.put("sku", oi.getProduct() != null && oi.getProduct().getSku() != null ? oi.getProduct().getSku()
                    : "SKU-" + order.getOrderNumber() + "-" + (items.length() + 1));
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
                    w = Double.parseDouble(ws.replaceAll("[^0-9.]", ""));
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
}
