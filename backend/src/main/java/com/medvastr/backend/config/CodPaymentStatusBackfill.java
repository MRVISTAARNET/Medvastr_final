package com.medvastr.backend.config;

import com.medvastr.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * One-time, idempotent data fix: COD orders that were marked DELIVERED from the admin panel
 * (or Delhivery sync) before the auto "cash collected" rule existed still say PENDING.
 * The courier has collected the cash for these, so mark them PAID. Safe to run on every boot.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CodPaymentStatusBackfill {

    private final OrderRepository orderRepo;

    @Transactional
    @EventListener(ApplicationReadyEvent.class)
    public void markDeliveredCodOrdersPaid() {
        try {
            int updated = orderRepo.markDeliveredCodOrdersPaid();
            if (updated > 0) {
                log.info("[COD Backfill] Marked {} delivered COD order(s) as PAID", updated);
            }
        } catch (Exception e) {
            log.warn("[COD Backfill] Skipped: {}", e.getMessage());
        }
    }
}
