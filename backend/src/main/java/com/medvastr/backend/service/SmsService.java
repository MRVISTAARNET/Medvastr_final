package com.medvastr.backend.service;

import com.medvastr.backend.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class SmsService {

    @Value("${msg91.enabled:false}")
    private boolean enabled;

    @Value("${msg91.authkey:}")
    private String authKey;

    @Value("${msg91.sender.default:MDVSTR}")
    private String defaultSender;

    @Value("${msg91.sender.otp:MVSOTP}")
    private String otpSender;

    @Value("${msg91.flow.otp:}")
    private String otpFlowId;

    @Value("${msg91.flow.order.cod:}")
    private String orderCodFlowId;

    @Value("${msg91.flow.order.prepaid:}")
    private String orderPrepaidFlowId;

    @Value("${msg91.flow.order.dispatched:}")
    private String orderDispatchedFlowId;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendOtpSms(String phone, String otpCode) {
        if (!enabled || otpFlowId == null || otpFlowId.isBlank()) {
            log.info("[SMS] Service disabled or OTP Flow ID not set. OTP for {}: {}", phone, otpCode);
            return;
        }

        String cleanPhone = formatPhoneNumber(phone);
        if (cleanPhone.isEmpty()) {
            log.warn("[SMS] Invalid phone number for OTP: {}", phone);
            return;
        }

        try {
            String url = "https://control.msg91.com/api/v5/flow/";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authkey", authKey);

            Map<String, Object> body = new HashMap<>();
            body.put("flow_id", otpFlowId);
            body.put("sender", otpSender);
            body.put("mobiles", cleanPhone);
            
            Map<String, String> variables = new HashMap<>();
            variables.put("OTP", otpCode);
            body.put("var", variables);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            log.info("[SMS] Sent OTP to {}. Response Status: {} | Body: {}", 
                    cleanPhone, response.getStatusCode(), response.getBody());
        } catch (Exception e) {
            log.error("[SMS] Failed to send OTP to {}: {}", cleanPhone, e.getMessage(), e);
        }
    }

    @Async
    public void sendOrderSms(Order order, String templateType) {
        if (!enabled) {
            log.info("[SMS] Service disabled. Skipping order update for {}", order.getOrderNumber());
            return;
        }

        String phone = order.getShippingPhone();
        String cleanPhone = formatPhoneNumber(phone);
        if (cleanPhone.isEmpty()) {
            log.warn("[SMS] Order {} has no valid shipping phone number: {}", order.getOrderNumber(), phone);
            return;
        }

        String flowId = null;
        Map<String, String> variables = new HashMap<>();

        if ("COD".equalsIgnoreCase(templateType)) {
            flowId = orderCodFlowId;
            variables.put("OrderID", order.getOrderNumber());
            variables.put("number", order.getTotalAmount().toString());
        } else if ("PREPAID".equalsIgnoreCase(templateType)) {
            flowId = orderPrepaidFlowId;
            variables.put("OrderID", order.getOrderNumber());
            variables.put("number", order.getTotalAmount().toString());
        } else if ("DISPATCHED".equalsIgnoreCase(templateType)) {
            flowId = orderDispatchedFlowId;
            variables.put("ORDERID", order.getOrderNumber());
        }

        if (flowId == null || flowId.isBlank()) {
            log.warn("[SMS] Flow ID for template {} not configured. Skipping order notification.", templateType);
            return;
        }

        try {
            String url = "https://control.msg91.com/api/v5/flow/";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authkey", authKey);

            Map<String, Object> body = new HashMap<>();
            body.put("flow_id", flowId);
            body.put("sender", defaultSender);
            body.put("mobiles", cleanPhone);
            body.put("var", variables);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            log.info("[SMS] Sent Order Notification ({}) to {}. Response Status: {} | Body: {}", 
                    templateType, cleanPhone, response.getStatusCode(), response.getBody());
        } catch (Exception e) {
            log.error("[SMS] Failed to send Order Notification ({}) to {}: {}", 
                    templateType, cleanPhone, e.getMessage(), e);
        }
    }

    private String formatPhoneNumber(String phone) {
        if (phone == null) return "";
        String clean = phone.replaceAll("[^0-9]", "");
        if (clean.isEmpty()) return "";
        if (clean.length() == 10) {
            return "91" + clean;
        }
        return clean;
    }
}
