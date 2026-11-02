package com.medvastr.backend.service;

import com.medvastr.backend.dto.GstReportDTO;
import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderItem;
import com.medvastr.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Builds the GST sales register used for monthly filing / sharing with the CA or a client.
 *
 * Mirrors how tax is already computed at checkout and on the Shiprocket payload:
 *  - item prices are GST-inclusive (default slab 5%, HSN 6211, or Product.tax when set)
 *  - order discount is spread across items in proportion to their value
 *  - Maharashtra deliveries (seller state) => CGST + SGST, everything else => IGST
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GstReportService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final BigDecimal DEFAULT_RATE = new BigDecimal("5");
    private static final String HSN = "6211";
    private static final long MAX_RANGE_DAYS = 366;
    /** GST tax periods follow the Indian calendar day. */
    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    private final OrderRepository orderRepo;

    public GstReportDTO build(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("Both 'from' and 'to' dates are required");
        }
        if (to.isBefore(from)) {
            throw new IllegalArgumentException("'to' date must not be before 'from' date");
        }
        if (ChronoUnit.DAYS.between(from, to) > MAX_RANGE_DAYS) {
            throw new IllegalArgumentException("Date range cannot exceed one year");
        }

        // Order.createdAt is stored in the server's default zone; the report range is in IST.
        LocalDateTime start = from.atStartOfDay(IST).withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
        LocalDateTime end = LocalDateTime.of(to, LocalTime.MAX).atZone(IST)
                .withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
        List<Order> orders = orderRepo.findCreatedBetween(start, end);

        List<GstReportDTO.Row> rows = new ArrayList<>();
        int excludedCount = 0;
        BigDecimal excludedValue = BigDecimal.ZERO;

        BigDecimal sTaxable = BigDecimal.ZERO, sCgst = BigDecimal.ZERO, sSgst = BigDecimal.ZERO;
        BigDecimal sIgst = BigDecimal.ZERO, sTax = BigDecimal.ZERO, sOther = BigDecimal.ZERO;
        BigDecimal sInvoice = BigDecimal.ZERO;

        for (Order o : orders) {
            BigDecimal total = nz(o.getTotalAmount());
            if (!isBillable(o)) {
                excludedCount++;
                excludedValue = excludedValue.add(total);
                continue;
            }

            BigDecimal subtotal = nz(o.getSubtotal());
            BigDecimal discount = nz(o.getDiscountAmount());
            BigDecimal tax = BigDecimal.ZERO;
            Set<String> rates = new LinkedHashSet<>();

            if (o.getItems() != null) {
                for (OrderItem oi : o.getItems()) {
                    BigDecimal itemPrice = nz(oi.getTotalPrice());
                    if (discount.signum() > 0 && subtotal.signum() > 0) {
                        BigDecimal proportion = itemPrice.divide(subtotal, 4, RoundingMode.HALF_UP);
                        itemPrice = itemPrice.subtract(discount.multiply(proportion));
                    }
                    BigDecimal rate = (oi.getProduct() != null && oi.getProduct().getTax() != null)
                            ? oi.getProduct().getTax() : DEFAULT_RATE;
                    rates.add(rate.stripTrailingZeros().toPlainString() + "%");
                    tax = tax.add(itemPrice.multiply(rate).divide(HUNDRED.add(rate), 2, RoundingMode.HALF_UP));
                }
            }
            tax = tax.setScale(2, RoundingMode.HALF_UP);

            BigDecimal other = nz(o.getShippingAmount()).add(nz(o.getCodFee()));
            BigDecimal taxable = total.subtract(other).subtract(tax).setScale(2, RoundingMode.HALF_UP);

            BigDecimal cgst = BigDecimal.ZERO, sgst = BigDecimal.ZERO, igst = BigDecimal.ZERO;
            if (isIntraState(o.getShippingState())) {
                cgst = tax.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
                sgst = tax.subtract(cgst);
            } else {
                igst = tax;
            }

            String invoiceNo = "INV-" + (o.getOrderNumber() == null ? "" : o.getOrderNumber().replaceAll("[^a-zA-Z0-9-]", ""));

            rows.add(GstReportDTO.Row.builder()
                    .invoiceNo(invoiceNo)
                    .invoiceDate(o.getCreatedAt() == null ? null
                            : o.getCreatedAt().atZone(ZoneId.systemDefault()).withZoneSameInstant(IST).toLocalDateTime())
                    .orderNumber(o.getOrderNumber())
                    .customerName(o.getShippingName())
                    .customerPhone(o.getShippingPhone())
                    .state(o.getShippingState())
                    .pincode(o.getShippingPincode())
                    .paymentMethod(o.getPaymentMethod() != null ? o.getPaymentMethod().name() : null)
                    .paymentStatus(o.getPaymentStatus() != null ? o.getPaymentStatus().name() : null)
                    .orderStatus(o.getStatus() != null ? o.getStatus().name() : null)
                    .hsn(HSN)
                    .taxRate(rates.isEmpty() ? DEFAULT_RATE.toPlainString() + "%" : String.join(",", rates))
                    .taxableValue(taxable)
                    .cgst(cgst)
                    .sgst(sgst)
                    .igst(igst)
                    .totalTax(tax)
                    .otherCharges(other)
                    .invoiceValue(total)
                    .build());

            sTaxable = sTaxable.add(taxable);
            sCgst = sCgst.add(cgst);
            sSgst = sSgst.add(sgst);
            sIgst = sIgst.add(igst);
            sTax = sTax.add(tax);
            sOther = sOther.add(other);
            sInvoice = sInvoice.add(total);
        }

        return GstReportDTO.builder()
                .from(from.toString())
                .to(to.toString())
                .rows(rows)
                .summary(GstReportDTO.Summary.builder()
                        .invoiceCount(rows.size())
                        .taxableValue(sTaxable)
                        .cgst(sCgst)
                        .sgst(sSgst)
                        .igst(sIgst)
                        .totalTax(sTax)
                        .otherCharges(sOther)
                        .invoiceValue(sInvoice)
                        .excludedCount(excludedCount)
                        .excludedValue(excludedValue)
                        .build())
                .build();
    }

    /** An order is a valid taxable sale if it was not cancelled/returned and money is collected or COD. */
    private boolean isBillable(Order o) {
        if (o.getStatus() == Order.OrderStatus.CANCELLED || o.getStatus() == Order.OrderStatus.RETURNED) {
            return false;
        }
        if (o.getPaymentStatus() == Order.PaymentStatus.FAILED || o.getPaymentStatus() == Order.PaymentStatus.REFUNDED) {
            return false;
        }
        if (o.getPaymentMethod() == Order.PaymentMethod.COD) {
            return true;
        }
        return o.getPaymentStatus() == Order.PaymentStatus.PAID;
    }

    private boolean isIntraState(String state) {
        if (state == null) return false;
        String s = state.trim();
        return s.equalsIgnoreCase("maharashtra") || s.equalsIgnoreCase("mh");
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}
