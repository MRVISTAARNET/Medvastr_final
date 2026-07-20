package com.medvastr.backend.service;

import com.medvastr.backend.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    @Value("${msg91.enabled:false}")
    private boolean enabled;

    @Value("${msg91.authkey:}")
    private String authKey;

    @Value("${msg91.flow.otp:}")
    private String otpFlowId;

    @Value("${msg91.flow.order.cod:}")
    private String orderCodFlowId;

    @Value("${msg91.flow.order.prepaid:}")
    private String orderPrepaidFlowId;

    @Value("${msg91.flow.order.dispatched:}")
    private String orderDispatchedFlowId;

    @Value("${msg91.template.otp:}")
    private String otpTemplateId;

    @Value("${msg91.template.order.cod:}")
    private String orderCodTemplateId;

    @Value("${msg91.template.order.prepaid:}")
    private String orderPrepaidTemplateId;

    @Value("${msg91.template.order.dispatched:}")
    private String orderDispatchedTemplateId;

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

        Map<String, String> variables = new HashMap<>();
        variables.put("OTP", otpCode);

        triggerOneApiFlow(otpFlowId, otpTemplateId, cleanPhone, variables);
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
        String templateId = null;
        Map<String, String> variables = new HashMap<>();

        if ("COD".equalsIgnoreCase(templateType)) {
            flowId = orderCodFlowId;
            templateId = orderCodTemplateId;
            variables.put("OrderID", order.getOrderNumber());
            variables.put("number", order.getTotalAmount().toString());
        } else if ("PREPAID".equalsIgnoreCase(templateType)) {
            flowId = orderPrepaidFlowId;
            templateId = orderPrepaidTemplateId;
            variables.put("OrderID", order.getOrderNumber());
            variables.put("number", order.getTotalAmount().toString());
        } else if ("DISPATCHED".equalsIgnoreCase(templateType)) {
            flowId = orderDispatchedFlowId;
            templateId = orderDispatchedTemplateId;
            variables.put("ORDERID", order.getOrderNumber());
            variables.put("CurrierAwsName", order.getCourierName() != null ? order.getCourierName() : "our logistics partner");
            variables.put("Numeric", order.getTrackingNumber() != null ? order.getTrackingNumber() : "");
        }

        if (flowId == null || flowId.isBlank()) {
            log.warn("[SMS] Flow ID for template {} not configured. Skipping order notification.", templateType);
            return;
        }

        triggerOneApiFlow(flowId, templateId, cleanPhone, variables);
    }

    private void triggerOneApiFlow(String flowId, String templateId, String cleanPhone, Map<String, String> variables) {
        try {
            // MSG91 OneAPI Flow execution endpoint
            String url = "https://control.msg91.com/api/v5/oneapi/api/flow/" + flowId + "/run";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authkey", authKey);

            // Construct new OneAPI Flow JSON payload structure
            Map<String, Object> body = new HashMap<>();
            Map<String, Object> data = new HashMap<>();
            List<Map<String, Object>> sendTo = new ArrayList<>();
            Map<String, Object> recipientNode = new HashMap<>();
            
            // Map template variables (support both plain and templateId-prefixed formats)
            Map<String, Object> varsNode = new HashMap<>();
            for (Map.Entry<String, String> entry : variables.entrySet()) {
                Map<String, String> valNode = new HashMap<>();
                valNode.put("value", entry.getValue());
                
                // 1. Plain variable mapping (e.g. "ORDERID" -> "MVS-123")
                varsNode.put(entry.getKey(), valNode);
                
                // 2. Prefixed variable mapping (e.g. "6a5ddb0d...:ORDERID" -> "MVS-123")
                if (templateId != null && !templateId.isBlank()) {
                    varsNode.put(templateId + ":" + entry.getKey(), valNode);
                }
            }
            
            List<Map<String, Object>> toList = new ArrayList<>();
            Map<String, Object> mobileNode = new HashMap<>();
            mobileNode.put("mobiles", cleanPhone);
            mobileNode.put("variables", varsNode);
            toList.add(mobileNode);
            
            recipientNode.put("to", toList);
            recipientNode.put("variables", varsNode);
            
            sendTo.add(recipientNode);
            data.put("sendTo", sendTo);
            body.put("data", data);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            log.info("[SMS] Sent Flow {} to {}. Status: {} | Response: {}", 
                    flowId, cleanPhone, response.getStatusCode(), response.getBody());
        } catch (Exception e) {
            log.error("[SMS] Failed to trigger Flow {} for {}: {}", 
                    flowId, cleanPhone, e.getMessage(), e);
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
