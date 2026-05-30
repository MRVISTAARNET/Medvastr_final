package com.medvastr.backend.dto;

import lombok.Data;

@Data
public class PaymentVerificationRequest {
    private String orderNumber;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
