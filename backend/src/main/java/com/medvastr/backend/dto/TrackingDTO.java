package com.medvastr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingDTO {
    private String orderNumber;
    private String status;
    private String trackingNumber;
    private String courierName;
    private String estimatedDeliveryDate;
    private List<TrackingEvent> timeline;
}

