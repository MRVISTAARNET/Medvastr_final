package com.medvastr.backend.service;

import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShiprocketService {

    @Value("${shiprocket.enabled:false}")
    private boolean enabled;

    @Value("${shiprocket.email}")
    private String email;

    @Value("${shiprocket.password}")
    private String password;

    @Value("${shiprocket.pickup_location:Primary}")
    private String pickupLocation;

    private final RestTemplate restTemplate = new RestTemplate();
    private String token;

    private void login() {
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
            log.info("[Shiprocket] Login Response Body: {}", res.getBody());

            if (res.getStatusCode() == HttpStatus.OK && res.getBody() != null) {
                JSONObject json = new JSONObject(res.getBody());
                this.token = json.getString("token");
                log.info("[Shiprocket] Successfully authenticated");

                // Debug: Fetch locations
                try {
                    HttpHeaders h = new HttpHeaders();
                    h.setBearerAuth(token);
                    ResponseEntity<String> locRes = restTemplate.exchange(
                            "https://apiv2.shiprocket.in/v1/external/settings/get/pickup", HttpMethod.GET,
                            new HttpEntity<>(h), String.class);
                    log.info("[Shiprocket] Available Pickup Locations: {}", locRes.getBody());
                } catch (Exception e) {
                    log.warn("[Shiprocket] Could not fetch locations: {}", e.getMessage());
                }
            } else {
                log.error("[Shiprocket] Login failed with status: {} - {}", res.getStatusCode(), res.getBody());
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("[Shiprocket] Login API Error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("[Shiprocket] Login exception: {}", e.getMessage());
        }
    }

    @Async
    public void createOrder(Order order) {
        if (!enabled)
            return;

        if (token == null)
            login();
        if (token == null) {
            log.error("[Shiprocket] Cannot push order {} - Token is null", order.getOrderNumber());
            return;
        }

        try {
            JSONObject shipOrder = new JSONObject();
            shipOrder.put("order_id", order.getOrderNumber());
            shipOrder.put("order_date",
                    order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            shipOrder.put("pickup_location", pickupLocation);
            shipOrder.put("channel_id", "");
            shipOrder.put("comment", order.getNotes() != null ? order.getNotes() : "E-commerce Order");

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
            if (e.getStatusCode().value() == 401)
                this.token = null;
        } catch (Exception e) {
            log.error("[Shiprocket] Error creating order {}: {}", order.getOrderNumber(), e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("401")) {
                this.token = null; // Forces re-login on next attempt
            }
        }
    }
}
