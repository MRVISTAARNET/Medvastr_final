package com.medvastr.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class OtpService {

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    private static class OtpData {
        String code;
        long expiry;

        OtpData(String code) {
            this.code = code;
            this.expiry = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(10);
        }
    }

    public String generateOtp(String email) {
        String code = String.format("%06d", random.nextInt(1000000));
        otpStorage.put(email, new OtpData(code));
        log.info("[OtpService] Generated OTP for {}: {}", email, code);
        return code;
    }

    public boolean validateOtp(String email, String code) {
        OtpData data = otpStorage.get(email);
        if (data == null)
            return false;

        if (System.currentTimeMillis() > data.expiry) {
            otpStorage.remove(email);
            return false;
        }

        boolean isValid = data.code.equals(code);
        if (isValid) {
            otpStorage.remove(email); // One-time use
        }
        return isValid;
    }
}
