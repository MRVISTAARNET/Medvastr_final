package com.medvastr.backend.service;

import com.medvastr.backend.model.OTP;
import com.medvastr.backend.repository.OTPRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OTPRepository otpRepo;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    private static final int OTP_VALIDITY_MINUTES = 10;

    @Transactional
    public void generateAndSendOtp(String email) {
        otpRepo.deleteExpiredOtps(LocalDateTime.now());

        String code = String.format("%06d", random.nextInt(1_000_000));

        OTP otp = OTP.builder()
                .email(email)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES))
                .used(false)
                .build();

        otpRepo.markAllUsed(email);
        otpRepo.save(otp);
        log.info("[OtpService] OTP generated for {}", email);

        emailService.sendOtpEmail(email, code);
    }

    @Transactional
    public boolean validateOtp(String email, String code) {
        try {
            Optional<OTP> otpOpt = otpRepo.findLatestValidOtp(email, LocalDateTime.now());

            if (otpOpt.isEmpty()) {
                log.warn("[OtpService] No valid OTP found for {}", email);
                return false;
            }

            OTP otp = otpOpt.get();

            if (!otp.getCode().equals(code)) {
                log.warn("[OtpService] Invalid OTP code for {}", email);
                return false;
            }

            otp.setUsed(true);
            otpRepo.save(otp);

            log.info("[OtpService] OTP validated successfully for {}", email);
            return true;
        } catch (Exception e) {
            log.error("[OtpService] Error validating OTP for {}", email, e);
            return false;
        }
    }

    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            otpRepo.deleteExpiredOtps(LocalDateTime.now());
            log.debug("[OtpService] Cleaned up expired OTPs");
        } catch (Exception e) {
            log.error("[OtpService] Error cleaning up expired OTPs", e);
        }
    }
}
