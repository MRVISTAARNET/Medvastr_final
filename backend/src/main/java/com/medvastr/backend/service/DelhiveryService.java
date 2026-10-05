package com.medvastr.backend.service;

import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderItem;
import com.medvastr.backend.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class DelhiveryService {

    private final OrderRepository orderRepository;
    private final SmsService smsService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final Set<Long> ongoingSyncs = ConcurrentHashMap.newKeySet();

    @Value("${delhivery.enabled:true}")
    private boolean enabled;

    @Value("${delhivery.token:}")
    private String token;

    @Value("${delhivery.client_name:}")
    private String clientName;

    @Value("${delhivery.pickup_location:}")
    private String pickupLocation;

    @Value("${delhivery.pickup_pincode:}")
    private String pickupPincode;

    @Value("${delhivery.base_url:https://track.delhivery.com}")
    private String baseUrl;

    @PostConstruct
    public void initDiagnostics() {
        log.info("========== DELHIVERY SERVICE DIAGNOSTICS ==========");
        log.info("Delhivery Enabled: {}", enabled);
        String maskedToken = (token != null && token.length() > 6)
                ? token.substring(0, 4) + "..." + token.substring(token.length() - 4)
                : "NOT CONFIGURED";
        log.info("Delhivery API Token: {}", maskedToken);
        log.info("Delhivery Client Name: {}", clientName);
        log.info("Delhivery Pickup Location: {}", pickupLocation);
        log.info("Delhivery Base URL: {}", baseUrl);
        log.info("===================================================");
    }

    public boolean isEnabled() {
        return enabled && token != null && !token.isBlank();
    }

    /**
     * Push B2C Order to Delhivery Direct API
     */
    public synchronized Map<String, Object> createShipment(Order order) {
        Map<String, Object> response = new HashMap<>();

        if (!isEnabled()) {
            response.put("success", false);
            response.put("message", "Delhivery Direct integration is not enabled or token is missing.");
            return response;
        }

        try {
            log.info("[Delhivery] Pushing order {} (ID: {}) to Delhivery Direct...", order.getOrderNumber(), order.getId());

            JSONObject rootObj = new JSONObject();

            // Pickup Location Node
            JSONObject pickupObj = new JSONObject();
            pickupObj.put("name", pickupLocation);
            pickupObj.put("pin", pickupPincode);
            pickupObj.put("city", "Mumbai");
            pickupObj.put("state", "Maharashtra");
            pickupObj.put("country", "India");
            pickupObj.put("phone", "9867041115");
            pickupObj.put("add", "Gagan Shopping Arcade Lower Level Shop No 1 Mumbai Goregaon East");

            rootObj.put("pickup_location", pickupObj);

            // Shipments Array Node
            JSONArray shipmentsArr = new JSONArray();
            JSONObject sObj = new JSONObject();

            sObj.put("name", order.getShippingName() != null ? order.getShippingName() : "Valued Customer");
            sObj.put("add", order.getShippingAddress() != null ? order.getShippingAddress() : "Address N/A");
            sObj.put("pin", order.getShippingPincode() != null ? order.getShippingPincode() : "400063");
            sObj.put("city", order.getShippingCity() != null ? order.getShippingCity() : "City N/A");
            sObj.put("state", order.getShippingState() != null ? order.getShippingState() : "State N/A");
            sObj.put("country", "India");

            String phone = order.getShippingPhone();
            if (phone != null && phone.startsWith("+91")) phone = phone.substring(3);
            if (phone != null && phone.startsWith("91") && phone.length() == 12) phone = phone.substring(2);
            sObj.put("phone", phone != null ? phone : "9867041115");

            sObj.put("order", order.getOrderNumber());
            
            boolean isCod = order.getPaymentMethod() == Order.PaymentMethod.COD;
            sObj.put("payment_mode", isCod ? "COD" : "Prepaid");
            sObj.put("cod_amount", isCod ? order.getTotalAmount().toString() : "0");
            sObj.put("total_amount", order.getTotalAmount().toString());
            sObj.put("quantity", String.valueOf(order.getItems() != null ? order.getItems().size() : 1));

            // Product Description
            StringBuilder prodDesc = new StringBuilder();
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    if (prodDesc.length() > 0) prodDesc.append(", ");
                    prodDesc.append(item.getQuantity()).append("x ").append(item.getProductName());
                }
            }
            sObj.put("products_desc", prodDesc.length() > 0 ? prodDesc.toString() : "Medvarn Medical Scrubs");

            sObj.put("weight", "0.5");
            sObj.put("shipment_width", "10");
            sObj.put("shipment_height", "10");
            sObj.put("shipment_length", "10");
            sObj.put("client", clientName);

            // Return Address
            sObj.put("return_name", pickupLocation);
            sObj.put("return_pin", pickupPincode);
            sObj.put("return_city", "Mumbai");
            sObj.put("return_state", "Maharashtra");
            sObj.put("return_country", "India");
            sObj.put("return_phone", "9867041115");
            sObj.put("return_add", "Gagan Shopping Arcade Lower Level Shop No 1 Mumbai Goregaon East");

            shipmentsArr.put(sObj);
            rootObj.put("shipments", shipmentsArr);

            // Clean and sanitize token
            String cleanToken = (token != null) ? token.trim().replaceAll("^\"|\"$", "").replaceAll("^'|'$", "") : "";

            // Send URL Encoded Form Data
            String apiUrl = baseUrl.replaceAll("/+$", "") + "/api/cmu/create.json";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "Token " + cleanToken);
            headers.set("Accept", "application/json");

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("format", "json");
            map.add("data", rootObj.toString());

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(map, headers);

            log.info("[Delhivery] POST Request to {} with Token prefix {}", apiUrl, (cleanToken.length() > 6 ? cleanToken.substring(0, 4) + "..." : "EMPTY"));
            ResponseEntity<String> res = restTemplate.postForEntity(apiUrl, requestEntity, String.class);

            log.info("[Delhivery] Response Status: {}, Body: {}", res.getStatusCode(), res.getBody());

            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                JSONObject resJson = new JSONObject(res.getBody());
                
                boolean isSuccess = resJson.optBoolean("success", false);
                JSONArray packages = resJson.optJSONArray("packages");

                if (packages != null && packages.length() > 0) {
                    JSONObject pkg = packages.getJSONObject(0);
                    String status = pkg.optString("status", "");
                    String waybill = pkg.optString("waybill", "");
                    JSONArray remarks = pkg.optJSONArray("remarks");

                    if ("Fail".equalsIgnoreCase(status) || waybill.isBlank()) {
                        String errMsg = (remarks != null && remarks.length() > 0) ? remarks.getString(0) : "Delhivery dispatch failed";
                        order.setShiprocketSyncStatus("FAILED");
                        order.setShiprocketSyncMessage("[Delhivery] " + errMsg);
                        orderRepository.save(order);

                        response.put("success", false);
                        response.put("message", errMsg);
                        return response;
                    }

                    // Success!
                    order.setTrackingNumber(waybill);
                    order.setCourierName("Delhivery Direct");
                    order.setShiprocketSyncStatus("MANIFESTED");
                    order.setShiprocketSyncMessage("Waybill generated via Delhivery Direct: " + waybill);
                    if (order.getStatus() == Order.OrderStatus.PENDING || order.getStatus() == Order.OrderStatus.CONFIRMED) {
                        order.setStatus(Order.OrderStatus.PROCESSING);
                    }
                    orderRepository.save(order);

                    response.put("success", true);
                    response.put("waybill", waybill);
                    response.put("message", "Order pushed to Delhivery Direct successfully! Waybill: " + waybill);
                    return response;
                } else if (isSuccess) {
                    order.setShiprocketSyncStatus("MANIFESTED");
                    order.setCourierName("Delhivery Direct");
                    orderRepository.save(order);

                    response.put("success", true);
                    response.put("message", "Order pushed to Delhivery Direct successfully.");
                    return response;
                } else {
                    String rm = resJson.optString("rmk", "Unknown error from Delhivery");
                    order.setShiprocketSyncStatus("FAILED");
                    order.setShiprocketSyncMessage("[Delhivery] " + rm);
                    orderRepository.save(order);

                    response.put("success", false);
                    response.put("message", rm);
                    return response;
                }
            } else {
                response.put("success", false);
                response.put("message", "HTTP " + res.getStatusCode() + " from Delhivery API");
                return response;
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            String errBody = e.getResponseBodyAsString();
            log.error("[Delhivery HTTP Error] Status: {}, Body: {}", e.getStatusCode(), errBody);
            order.setShiprocketSyncStatus("FAILED");
            order.setShiprocketSyncMessage("[Delhivery " + e.getStatusCode() + "] " + (errBody.isBlank() ? e.getMessage() : errBody));
            orderRepository.save(order);

            response.put("success", false);
            response.put("message", "Delhivery API Error (" + e.getStatusCode() + "): " + (errBody.isBlank() ? "Invalid API Token or Unauthorized IP. Check token in Delhivery One Panel." : errBody));
            return response;
        } catch (Exception e) {
            log.error("[Delhivery] Error pushing order {}: {}", order.getOrderNumber(), e.getMessage(), e);
            order.setShiprocketSyncStatus("FAILED");
            order.setShiprocketSyncMessage("[Delhivery Error] " + e.getMessage());
            orderRepository.save(order);

            response.put("success", false);
            response.put("message", "Exception pushing to Delhivery: " + e.getMessage());
            return response;
        }
    }

    /**
     * Fetch Live Tracking Status from Delhivery API
     */
    public synchronized Map<String, Object> trackWaybill(String waybill) {
        Map<String, Object> result = new HashMap<>();
        if (waybill == null || waybill.isBlank()) {
            result.put("success", false);
            result.put("message", "No waybill provided");
            return result;
        }

        try {
            String apiUrl = baseUrl.replaceAll("/+$", "") + "/api/v1/packages/json/?waybill=" + waybill.trim() + "&token=" + token.trim();
            log.info("[Delhivery Tracking] Requesting tracking info for waybill {}", waybill);

            ResponseEntity<String> res = restTemplate.getForEntity(apiUrl, String.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                JSONObject json = new JSONObject(res.getBody());
                JSONArray shipments = json.optJSONArray("ShipmentData");

                if (shipments != null && shipments.length() > 0) {
                    JSONObject shipmentObj = shipments.getJSONObject(0).optJSONObject("Shipment");
                    if (shipmentObj != null) {
                        JSONObject statusObj = shipmentObj.optJSONObject("Status");
                        String statusName = statusObj != null ? statusObj.optString("Status", "") : "";
                        String statusInstructions = statusObj != null ? statusObj.optString("Instructions", "") : "";

                        result.put("success", true);
                        result.put("status", statusName);
                        result.put("instructions", statusInstructions);
                        result.put("trackingUrl", "https://www.delhivery.com/track/package/" + waybill);
                        return result;
                    }
                }
            }
            result.put("success", false);
            result.put("message", "No tracking records found on Delhivery");
            return result;
        } catch (Exception e) {
            log.error("[Delhivery Tracking] Error tracking waybill {}: {}", waybill, e.getMessage());
            result.put("success", false);
            result.put("message", e.getMessage());
            return result;
        }
    }

    /**
     * Check Delhivery Serviceability for a Pincode
     */
    public boolean checkPincodeServiceability(String pincode) {
        if (pincode == null || pincode.length() != 6) return false;
        try {
            String apiUrl = baseUrl.replaceAll("/+$", "") + "/c/api/pin-codes/json/?token=" + token.trim() + "&filter_codes=" + pincode.trim();
            ResponseEntity<String> res = restTemplate.getForEntity(apiUrl, String.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                JSONObject json = new JSONObject(res.getBody());
                JSONArray codes = json.optJSONArray("delivery_codes");
                if (codes != null && codes.length() > 0) {
                    JSONObject codeObj = codes.getJSONObject(0).optJSONObject("postal_code");
                    if (codeObj != null) {
                        String isRemarks = codeObj.optString("remarks", "");
                        return !"Out of delivery area".equalsIgnoreCase(isRemarks);
                    }
                }
            }
        } catch (Exception e) {
            log.error("[Delhivery Serviceability] Error checking pincode {}: {}", pincode, e.getMessage());
        }
        return true;
    }
}
