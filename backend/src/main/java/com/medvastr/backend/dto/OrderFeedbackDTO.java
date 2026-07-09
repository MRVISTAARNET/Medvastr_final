package com.medvastr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderFeedbackDTO {
    private Long id;
    private String orderNumber;
    private Integer rating;
    private String remarks;
    private String customerName;
    private String customerEmail;
    private LocalDateTime createdAt;
}
