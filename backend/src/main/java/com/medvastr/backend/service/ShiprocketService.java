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

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShiprocketService {
    private final OrderRepository orderRepository;
    private final java.util.Set<Long> ongoingSyncs = java.util.concurrent.ConcurrentHashMap.newKeySet();

    @Value("${shiprocket.enabled:false}")
    private boolean enabled;

    @Value("${shiprocket.email:}")
    private String email;

    @Value("${shiprocket.password:}")
    private String password;

    @Value("${shiprocket.pickup_location:Primary}")
    private String pickupLocation;

    @Value("${shiprocket.pickup_postcode:400063}")
    private String pickupPostcode;

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
            log.info("Shiprocket Service: DISABLED (set SHIPROCKET_ENABLED=true in env)");
            log.info("============================================");
            return;
        }
        log.info("Shiprocket Service: ENABLED");
        String maskedEmail = (email != null && email.length() > 3) ? email.substring(0, 3) + "****" : "NOT SET";
        String maskedPass = (password != null && !password.isBlank()) ? "SET (" + password.length() + " chars)" : "NOT SET";
        log.info("Shiprocket Email: {}", maskedEmail);
        log.info("Shiprocket Password: {}", maskedPass);
        log.info("Shiprocket Pickup Location: {}", pickupLocation);
        log.info("Attempting startup auth test...");
        try {
            String token = login();
            if (token != null && !token.isBlank()) {
                log.info("Startup Auth Test: SUCCESS - Token obtained (length={})", token.length());
            } else {
                log.error("Startup Auth Test: FAILED - Check SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in Beanstalk env!");
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

    private void preloadOrderRelations(Order order) {
        if (order.getItems() != null) {
            order.getItems().forEach(i -> {
                if (i.getProduct() != null) {
                    i.getProduct().getName();
                    i.getProduct().getTax();
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

    @Async
    @Transactional
    public void createOrder(Long orderId) {
        if (!enabled) {
            log.warn("[Shiprocket] Service is DISABLED - order {} will NOT be pushed. Set SHIPROCKET_ENABLED=true in Beanstalk env.", orderId);
            return;
        }

        if (!ongoingSyncs.add(orderId)) {
            log.info("[Shiprocket] Sync already in progress for order id={}. Skipping duplicate trigger.", orderId);
            return;
        }

        log.info("[Shiprocket] Starting async push for order id={}", orderId);
        try {
            Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
            if (order.getShiprocketOrderId() != null) {
                log.info("[Shiprocket] Order {} already synced (ID: {}). Skipping.", order.getOrderNumber(), order.getShiprocketOrderId());
                return;
            }

            preloadOrderRelations(order);

            String token = getValidToken();
            if (token == null) {
                log.error("[Shiprocket] Cannot push order {} - Failed to obtain auth token. Check SHIPROCKET_EMAIL/SHIPROCKET_PASSWORD.", order.getOrderNumber());
                return;
            }

            pushOrderToShiprocket(order, token);
        } catch (Exception e) {
            log.error("[Shiprocket] Error pushing order id={}: {}", orderId, e.getMessage(), e);
        } finally {
            ongoingSyncs.remove(orderId);
        }
    }

    @Transactional
    public String createOrderSync(Long orderId) {
        if (!enabled) {
            return "Shiprocket service is disabled in application.properties (shiprocket.enabled=false)";
        }
        if (!ongoingSyncs.add(orderId)) {
            return "Sync already in progress for order id=" + orderId;
        }
        try {
            Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
            preloadOrderRelations(order);

            String token = getValidToken();
            if (token == null) {
                return "Failed to authenticate with Shiprocket (getValidToken returned null)";
            }
            return pushOrderToShiprocketSync(order, token);
        } catch (Exception e) {
            log.error("[Shiprocket Sync] Sync error: ", e);
            return "Error: " + e.getMessage();
        } finally {
            ongoingSyncs.remove(orderId);
        }
    }

    private String pushOrderToShiprocketSync(Order order, String token) {
        try {
            JSONObject shipOrder = buildShiprocketOrderJson(order);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            HttpEntity<String> entity = new HttpEntity<>(shipOrder.toString(), headers);
            
            log.info("\n=== Shiprocket Request ===\nURL: https://apiv2.shiprocket.in/v1/external/orders/create/adhoc\nPayload:\n{}\n==========================", shipOrder.toString());

            ResponseEntity<String> res = restTemplate.postForEntity(
                    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
                    entity,
                    String.class);

            log.info("\n=== Shiprocket Response ===\nHTTP Status: {}\nResponse Body:\n{}\n==========================", res.getStatusCode(), res.getBody());

            if (res.getStatusCode() == HttpStatus.OK || res.getStatusCode() == HttpStatus.CREATED) {
                JSONObject resJson = new JSONObject(res.getBody());
                long srOrderId = resJson.optLong("order_id", 0);
                long shipmentId = resJson.optLong("shipment_id", 0);
                String status = resJson.optString("status", "NEW");
                String awb = resJson.optString("awb_code");
                String courier = resJson.optString("courier_name");

                if (srOrderId > 0) order.setShiprocketOrderId(srOrderId);
                if (shipmentId > 0) order.setShiprocketShipmentId(shipmentId);
                order.setShiprocketSyncStatus(status);

                if (awb != null && !awb.isEmpty() && !awb.equals("null")) {
                    order.setTrackingNumber(awb);
                }
                if (courier != null && !courier.isEmpty() && !courier.equals("null")) {
                    order.setCourierName(courier);
                }

                if (status != null && status.toUpperCase().contains("CANCEL")) {
                    String reason = fetchCancellationReason(srOrderId, token);
                    order.setShiprocketSyncMessage("CANCELLED. Reason: " + reason);
                } else {
                    order.setShiprocketSyncMessage("Synced successfully with status: " + status);
                }
                orderRepository.save(order);
            } else {
                order.setShiprocketSyncStatus("FAILED");
                order.setShiprocketSyncMessage("HTTP Error " + res.getStatusCode() + ": " + res.getBody());
                orderRepository.save(order);
            }

            return "Status: " + res.getStatusCode() + " | Response: " + res.getBody() + " | Payload Sent: " + shipOrder.toString();
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("\n=== Error Response ===\nHTTP Status: {}\nResponse Body:\n{}\n==========================", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401) {
                tokenCache.remove(TOKEN_CACHE_KEY);
            }
            order.setShiprocketSyncStatus("FAILED");
            order.setShiprocketSyncMessage("API Error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            orderRepository.save(order);
            return "API Error Code: " + e.getStatusCode() + " | Response: " + e.getResponseBodyAsString();
        } catch (Exception e) {
            log.error("[Shiprocket Sync] Exception: ", e);
            order.setShiprocketSyncStatus("FAILED");
            order.setShiprocketSyncMessage("Exception: " + e.getMessage());
            orderRepository.save(order);
            return "Exception: " + e.getMessage();
        }
    }

    private void pushOrderToShiprocket(Order order, String token) {
        try {
            JSONObject shipOrder = buildShiprocketOrderJson(order);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            HttpEntity<String> entity = new HttpEntity<>(shipOrder.toString(), headers);

            log.info("\n=== Shiprocket Request ===\nURL: https://apiv2.shiprocket.in/v1/external/orders/create/adhoc\nPayload:\n{}\n==========================", shipOrder.toString());
            ResponseEntity<String> res = restTemplate.postForEntity(
                    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
                    entity,
                    String.class);

            log.info("\n=== Shiprocket Response ===\nHTTP Status: {}\nResponse Body:\n{}\n==========================", res.getStatusCode(), res.getBody());

            if (res.getStatusCode() == HttpStatus.OK || res.getStatusCode() == HttpStatus.CREATED) {
                try {
                    JSONObject resJson = new JSONObject(res.getBody());
                    long srOrderId = resJson.optLong("order_id", 0);
                    long shipmentId = resJson.optLong("shipment_id", 0);
                    String status = resJson.optString("status", "NEW");
                    String awb = resJson.optString("awb_code");
                    String courier = resJson.optString("courier_name");

                    if (srOrderId > 0) order.setShiprocketOrderId(srOrderId);
                    if (shipmentId > 0) order.setShiprocketShipmentId(shipmentId);
                    order.setShiprocketSyncStatus(status);

                    if (awb != null && !awb.isEmpty() && !awb.equals("null")) {
                        order.setTrackingNumber(awb);
                    }
                    if (courier != null && !courier.isEmpty() && !courier.equals("null")) {
                        order.setCourierName(courier);
                    }

                    if (status != null && status.toUpperCase().contains("CANCEL")) {
                        String reason = fetchCancellationReason(srOrderId, token);
                        order.setShiprocketSyncMessage("CANCELLED. Reason: " + reason);
                    } else {
                        order.setShiprocketSyncMessage("Synced successfully with status: " + status);
                    }
                    orderRepository.save(order);
                } catch (Exception parseEx) {
                    log.error("[Shiprocket] Failed to parse success response: {}", parseEx.getMessage());
                    order.setShiprocketSyncStatus("ERROR");
                    order.setShiprocketSyncMessage("Failed to parse API response: " + parseEx.getMessage());
                    orderRepository.save(order);
                }
            } else {
                log.error("[Shiprocket] Failed to push order {}: {}", order.getOrderNumber(), res.getBody());
                order.setShiprocketSyncStatus("FAILED");
                order.setShiprocketSyncMessage("HTTP Error " + res.getStatusCode() + ": " + res.getBody());
                orderRepository.save(order);
            }

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("\n=== Error Response ===\nHTTP Status: {}\nResponse Body:\n{}\n==========================", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401) {
                tokenCache.remove(TOKEN_CACHE_KEY);
            }
            order.setShiprocketSyncStatus("FAILED");
            order.setShiprocketSyncMessage("API Error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            orderRepository.save(order);
        } catch (Exception e) {
            log.error("[Shiprocket] Error pushing order {}: {}", order.getOrderNumber(), e.getMessage());
            order.setShiprocketSyncStatus("FAILED");
            order.setShiprocketSyncMessage("Exception: " + e.getMessage());
            orderRepository.save(order);
        }
    }

    public String fetchCancellationReason(Long shiprocketOrderId, String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            log.info("\n=== Shiprocket Request ===\nURL: https://apiv2.shiprocket.in/v1/external/orders/show/{}\n==========================", shiprocketOrderId);
            ResponseEntity<String> res = restTemplate.exchange(
                    "https://apiv2.shiprocket.in/v1/external/orders/show/" + shiprocketOrderId,
                    HttpMethod.GET,
                    entity,
                    String.class);
            log.info("\n=== Shiprocket Response ===\nHTTP Status: {}\nResponse Body:\n{}\n==========================", res.getStatusCode(), res.getBody());

            JSONObject json = new JSONObject(res.getBody());
            if (json.has("data")) {
                JSONObject dataObj = json.getJSONObject("data");
                if (dataObj.has("cancellation_reason")) {
                    return dataObj.optString("cancellation_reason", "None specified");
                }
            }
            if (json.has("cancellation_reason")) {
                return json.optString("cancellation_reason", "None specified");
            }
            return "No reason provided by Shiprocket API";
        } catch (Exception e) {
            log.error("[Shiprocket] Error querying cancellation reason for ID {}: {}", shiprocketOrderId, e.getMessage());
            return "Failed to fetch cancellation reason: " + e.getMessage();
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

        String fullName = order.getShippingName() != null ? order.getShippingName().trim() : "Customer";
        if (fullName.isEmpty()) fullName = "Customer";
        String[] names = fullName.split("\\s+");
        String billingCustomerName = names[0].replaceAll("[^a-zA-Z0-9 ]", "").trim();
        if (billingCustomerName.isEmpty()) {
            billingCustomerName = "Customer";
        }
        String billingLastName = names.length > 1 ? names[names.length - 1].replaceAll("[^a-zA-Z0-9 ]", "").trim() : "";
        if (billingLastName.isEmpty()) {
            billingLastName = billingCustomerName;
        }
        shipOrder.put("billing_customer_name", billingCustomerName);
        shipOrder.put("billing_last_name", billingLastName);

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
            double unitPrice = oi.getUnitPrice().doubleValue();
            BigDecimal itemPrice = oi.getTotalPrice();
            BigDecimal discountAmount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal orderSubtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;

            if (discountAmount.compareTo(BigDecimal.ZERO) > 0 && orderSubtotal.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal proportion = itemPrice.divide(orderSubtotal, 4, java.math.RoundingMode.HALF_UP);
                itemPrice = itemPrice.subtract(discountAmount.multiply(proportion));
            }
            double discountedUnitPrice = itemPrice.doubleValue() / oi.getQuantity();
            discountedUnitPrice = Math.round(discountedUnitPrice * 100.0) / 100.0;
            item.put("selling_price", String.format("%.2f", discountedUnitPrice));

             // Calculate product specific inclusive GST
             double taxPercent = 5.0;
             if (oi.getProduct() != null && oi.getProduct().getTax() != null) {
                 taxPercent = oi.getProduct().getTax().doubleValue();
             }
             double taxRate = taxPercent / 100.0;
             double taxAmount = (discountedUnitPrice * taxRate / (1.0 + taxRate)) * oi.getQuantity();
             double roundedTax = Math.round(taxAmount * 100.0) / 100.0;

             item.put("tax", taxPercent);

            boolean isIntrastate = false;
            String buyerState = order.getShippingState();
            if (buyerState != null && (buyerState.trim().equalsIgnoreCase("maharashtra") || buyerState.trim().equalsIgnoreCase("mh"))) {
                isIntrastate = true;
            }

            if (isIntrastate) {
                double splitTax = Math.round((roundedTax / 2.0) * 100.0) / 100.0;
                item.put("cgst", String.format("%.2f", splitTax));
                item.put("sgst", String.format("%.2f", splitTax));
                item.put("igst", "0.00");
            } else {
                item.put("cgst", "0.00");
                item.put("sgst", "0.00");
                item.put("igst", String.format("%.2f", roundedTax));
            }
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
        shipOrder.put("sub_total", String.format("%.2f", order.getTotalAmount().doubleValue()));

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
        
        String orderId = json.optString("channel_order_id");
        if (orderId.isEmpty() || orderId.equalsIgnoreCase("enter your channel order id")) {
            orderId = json.optString("order_id");
        }
        
        String status = json.optString("current_status");
        if (status.isEmpty()) {
            status = json.optString("shipment_status");
        }
        if (status.isEmpty()) {
            status = json.optString("status");
        }
        
        String awb = json.optString("awb");
        if (awb.isEmpty()) {
            awb = json.optString("awb_code");
        }
        
        String courier = json.optString("courier_name");

        if (orderId == null || orderId.isEmpty()) {
            log.warn("[Shiprocket Webhook] Missing order_id in payload");
            return;
        }

        var orderOpt = orderRepository.findByOrderNumber(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
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
        }
    }

    private void updateOrderStatusMapping(Order order, String shiprocketStatus) {
        if (shiprocketStatus == null)
            return;

        // Always save the raw Shiprocket status string so admin can see it
        order.setShiprocketSyncStatus(shiprocketStatus);

        String s = shiprocketStatus.toLowerCase().trim();

        // ── CONFIRMED / READY TO SHIP ─────────────────────────────────────
        if (s.equals("new") || s.equals("ready to ship") || s.equals("return order received")
                || s.equals("pickup pending")) {
            order.setStatus(Order.OrderStatus.CONFIRMED);

        // ── PROCESSING (Pickup / Manifest) ────────────────────────────────
        } else if (s.contains("pickup scheduled") || s.contains("pickup generated")
                || s.contains("manifested") || s.contains("label generated")
                || s.contains("processing") || s.contains("pickup queued")
                || s.contains("pickup exception")) {
            order.setStatus(Order.OrderStatus.PROCESSING);

        // ── SHIPPED / IN TRANSIT ──────────────────────────────────────────
        } else if (s.contains("shipped") || s.contains("in transit")
                || s.contains("reached at destination") || s.contains("reached destination")
                || s.contains("in-transit") || s.contains("forwarded")) {
            order.setStatus(Order.OrderStatus.SHIPPED);

        // ── OUT FOR DELIVERY ──────────────────────────────────────────────
        } else if (s.contains("out for delivery") || s.contains("out_for_delivery")) {
            order.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);

        // ── DELIVERED ─────────────────────────────────────────────────────
        } else if (s.contains("delivered") && !s.contains("undelivered") && !s.contains("rto")) {
            order.setStatus(Order.OrderStatus.DELIVERED);
            order.setDeliveredAt(java.time.LocalDateTime.now());

        // ── RETURNED / RTO ────────────────────────────────────────────────
        } else if (s.contains("rto") || s.contains("return") || s.contains("returned")) {
            order.setStatus(Order.OrderStatus.RETURNED);

        // ── CANCELLED ─────────────────────────────────────────────────────
        } else if (s.contains("cancel")) {
            order.setStatus(Order.OrderStatus.CANCELLED);

        // ── NDR / UNDELIVERED — keep SHIPPED, just note status ───────────
        } else if (s.contains("ndr") || s.contains("undelivered") || s.contains("failed delivery")
                || s.contains("delivery failed")) {
            // Don't regress status — stay at SHIPPED level so admin can act
            if (order.getStatus() != Order.OrderStatus.OUT_FOR_DELIVERY
                    && order.getStatus() != Order.OrderStatus.SHIPPED) {
                order.setStatus(Order.OrderStatus.SHIPPED);
            }
        }
        // Any unrecognised status → leave internal status unchanged
    }

    public String getServiceability(String deliveryPincode, double weight, boolean isCod) {
        return getServiceabilityInternal(deliveryPincode, weight, isCod, true);
    }

    private String getServiceabilityInternal(String deliveryPincode, double weight, boolean isCod, boolean retryOn401) {
        try {
            String token = getValidToken();

            String url = String.format("https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=%s&delivery_postcode=%s&weight=%s&cod=%d",
                    pickupPostcode, deliveryPincode, weight, isCod ? 1 : 0);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return res.getBody();
        } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized e) {
            if (retryOn401) {
                log.warn("[Shiprocket] 401 Unauthorized on serviceability. Invalidating token and retrying...");
                tokenCache.remove(TOKEN_CACHE_KEY);
                return getServiceabilityInternal(deliveryPincode, weight, isCod, false);
            }
            log.error("[Shiprocket] Serviceability unauthorized after retry for {}: {}", deliveryPincode, e.getMessage());
            return "{\"success\": false, \"message\": \"Unauthorized\"}";
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

    private boolean fetchAndSaveAwbFromShiprocket(Order order, String token) {
        if (order.getShiprocketOrderId() == null || order.getShiprocketOrderId() <= 0) {
            return false;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> res = restTemplate.exchange(
                    "https://apiv2.shiprocket.in/v1/external/orders/show/" + order.getShiprocketOrderId(),
                    HttpMethod.GET,
                    entity,
                    String.class);

            if (res.getStatusCode() == HttpStatus.OK && res.getBody() != null) {
                JSONObject json = new JSONObject(res.getBody());
                if (json.has("data")) {
                    JSONObject dataObj = json.getJSONObject("data");
                    
                    String awb = dataObj.optString("awb_code");
                    String courier = dataObj.optString("courier_name");
                    
                    if ((awb == null || awb.isEmpty() || awb.equals("null")) && dataObj.has("shipments")) {
                        Object shipmentsObj = dataObj.get("shipments");
                        if (shipmentsObj instanceof JSONArray) {
                            JSONArray shipments = (JSONArray) shipmentsObj;
                            if (shipments.length() > 0) {
                                JSONObject firstShipment = shipments.getJSONObject(0);
                                awb = firstShipment.optString("awb");
                                courier = firstShipment.optString("courier");
                            }
                        } else if (shipmentsObj instanceof JSONObject) {
                            JSONObject firstShipment = (JSONObject) shipmentsObj;
                            awb = firstShipment.optString("awb");
                            courier = firstShipment.optString("courier");
                        }
                    }
                    
                    if (awb != null && !awb.isEmpty() && !awb.equals("null")) {
                        order.setTrackingNumber(awb);
                        if (courier != null && !courier.isEmpty() && !courier.equals("null")) {
                            order.setCourierName(courier);
                        }
                        orderRepository.save(order);
                        log.info("[Shiprocket Sync] Successfully fetched and saved AWB {} for order {}", awb, order.getOrderNumber());
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            log.error("[Shiprocket Sync] Failed to fetch AWB from show API for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
        return false;
    }

    @Transactional
    public void syncTrackingStatus(Order order) {
        // If tracking AWB is empty, try to fetch it dynamically using the Shiprocket Order ID
        if (order.getTrackingNumber() == null || order.getTrackingNumber().trim().isEmpty() || order.getTrackingNumber().equalsIgnoreCase("null")) {
            if (order.getShiprocketOrderId() != null && order.getShiprocketOrderId() > 0) {
                log.info("[Shiprocket Sync] Tracking number empty for order {}. Attempting to fetch AWB via Order ID {}", order.getOrderNumber(), order.getShiprocketOrderId());
                try {
                    String token = getValidToken();
                    if (token != null) {
                        fetchAndSaveAwbFromShiprocket(order, token);
                    }
                } catch (Exception e) {
                    log.error("[Shiprocket Sync] Failed to get valid token to fetch AWB for order {}: {}", order.getOrderNumber(), e.getMessage());
                }
            }
        }

        if (order.getTrackingNumber() == null || order.getTrackingNumber().trim().isEmpty() || order.getTrackingNumber().equalsIgnoreCase("null")) {
            return;
        }
        try {
            String trackingDetails = getTrackingDetails(order.getTrackingNumber());
            if (trackingDetails != null && !trackingDetails.contains("\"success\":false") && !trackingDetails.contains("\"success\": false")) {
                JSONObject json = new JSONObject(trackingDetails);
                if (json.has("tracking_data")) {
                    JSONObject trackingData = json.getJSONObject("tracking_data");
                    
                    // Extract current status
                    String status = "";
                    if (trackingData.has("shipment_track")) {
                        JSONArray trackArr = trackingData.getJSONArray("shipment_track");
                        if (trackArr.length() > 0) {
                            JSONObject trackObj = trackArr.getJSONObject(0);
                            status = trackObj.optString("current_status");
                            
                            // Extract EDD (Estimated Delivery Date)
                            String edd = trackObj.optString("edd");
                            if (edd != null && !edd.isEmpty() && !edd.equalsIgnoreCase("null")) {
                                order.setEstimatedDeliveryDate(edd);
                            }
                        }
                    }
                    
                    if (status == null || status.isEmpty()) {
                        status = trackingData.optString("shipment_status");
                    }
                    
                    if (status != null && !status.isEmpty()) {
                        log.info("[Shiprocket Sync] Updating order {} status from tracking: {}", order.getOrderNumber(), status);
                        updateOrderStatusMapping(order, status);
                    }
                    
                    orderRepository.save(order);
                }
            }
        } catch (Exception e) {
            log.error("[Shiprocket Sync] Failed to sync tracking for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }
}
