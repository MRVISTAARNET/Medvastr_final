package com.medvastr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * GST sales register for a date range. Prices in Medvarn are GST-inclusive, so
 * taxableValue + totalTax + otherCharges == invoiceValue for every row.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstReportDTO {
    private String from;
    private String to;
    private Summary summary;
    private List<Row> rows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private int invoiceCount;
        private BigDecimal taxableValue;
        private BigDecimal cgst;
        private BigDecimal sgst;
        private BigDecimal igst;
        private BigDecimal totalTax;
        private BigDecimal otherCharges;
        private BigDecimal invoiceValue;
        /** Orders in range that were left out (cancelled / returned / unpaid online / failed). */
        private int excludedCount;
        private BigDecimal excludedValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Row {
        private String invoiceNo;
        private LocalDateTime invoiceDate;
        private String orderNumber;
        private String customerName;
        private String customerPhone;
        private String state;
        private String pincode;
        private String paymentMethod;
        private String paymentStatus;
        private String orderStatus;
        private String hsn;
        /** e.g. "5%" or "5%,12%" when the order has mixed GST slabs. */
        private String taxRate;
        private BigDecimal taxableValue;
        private BigDecimal cgst;
        private BigDecimal sgst;
        private BigDecimal igst;
        private BigDecimal totalTax;
        /** Shipping + COD fee (not taxed on current invoices). */
        private BigDecimal otherCharges;
        private BigDecimal invoiceValue;
    }
}
