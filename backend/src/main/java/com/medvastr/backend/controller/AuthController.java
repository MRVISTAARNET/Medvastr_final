package com.medvastr.backend.controller;

import com.medvastr.backend.dto.*;
import com.medvastr.backend.repository.UserRepository;
import com.medvastr.backend.service.AuthService;
import com.medvastr.backend.service.OtpService;
import java.util.UUID;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({ "/api/auth", "/auth" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {

    private final AuthService s;
    private final OtpService otpService;
    private final UserRepository userRepository;

    // ── Register ─────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest r) {
        return ResponseEntity.status(201).body(ApiResponse.ok("Registered", s.register(r)));
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful", s.login(r)));
    }

    // ── Forgot Password: send email with reset link ────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam String email) {
        s.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.ok(
                "If this email is registered you will receive a reset link shortly.", null));
    }

    // ── Validate reset token (front-end checks before showing reset form) ─
    @GetMapping("/reset-password/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestParam String token) {
        boolean valid = s.validateResetToken(token);
        return ResponseEntity.ok(ApiResponse.ok(valid ? "Token is valid" : "Token invalid or expired", valid));
    }

    // ── OTP: Request code ─────────────────────────────────────────────────
    @PostMapping("/otp-request")
    public ResponseEntity<ApiResponse<Void>> requestOtp(@RequestBody @Valid OtpRequest r) {
        String resolvedId = resolveIdentifier(r.getEmail());
        log.info("[OTP] Request for identifier: {}, resolved identifier: {}", r.getEmail(), resolvedId);
        
        boolean userExists;
        if (resolvedId.contains("@")) {
            userExists = userRepository.existsByEmail(resolvedId);
        } else {
            String cleanPhone = resolvedId.replaceAll("[^0-9]", "");
            String suffix = cleanPhone.length() > 10 ? cleanPhone.substring(cleanPhone.length() - 10) : cleanPhone;
            userExists = userRepository.findByPhoneSuffix(suffix).isPresent();
        }
        
        if (!userExists) {
            log.info("[OTP] Auto-registering new user with identifier: {}", resolvedId);
            RegisterRequest req = new RegisterRequest();
            
            if (resolvedId.contains("@")) {
                req.setEmail(resolvedId);
                req.setPhone("");
                req.setFirstName(resolvedId.split("@")[0]);
            } else {
                req.setEmail(null); // Keep email null for phone-only registration!
                req.setPhone(resolvedId);
                req.setFirstName("User");
            }
            
            req.setLastName("");
            req.setPassword(UUID.randomUUID().toString()); // random secure pass since it's OTP based
            s.register(req);
        }
        
        boolean isEmail = r.getEmail().contains("@");
        String phoneToSend = null;
        if (!isEmail) {
            phoneToSend = formatPhoneNumber(r.getEmail());
        }
        
        otpService.generateAndSendOtp(resolvedId, isEmail, !isEmail, phoneToSend);
        log.info("[OTP] Code sent to resolved identifier {} (via Email: {}, via SMS: {})", resolvedId, isEmail, !isEmail);
        return ResponseEntity.ok(ApiResponse.ok("Verification code sent successfully.", null));
    }

    // ── OTP: Verify code and log in ────────────────────────────────────────
    @PostMapping("/otp-login")
    public ResponseEntity<ApiResponse<AuthResponse>> otpLogin(@RequestBody @Valid OtpRequest r) {
        String resolvedId = resolveIdentifier(r.getEmail());
        log.info("[OTP] Login attempt for identifier: {}, resolved identifier: {}", r.getEmail(), resolvedId);
        
        if (r.getOtp() == null || r.getOtp().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.err("OTP code is required."));
        }
        if (otpService.validateOtp(resolvedId, r.getOtp())) {
            AuthResponse auth = s.loginViaOtp(resolvedId);
            log.info("[OTP] Login successful for resolved identifier: {}", resolvedId);
            return ResponseEntity.ok(ApiResponse.ok("Login successful", auth));
        } else {
            log.warn("[OTP] Invalid or expired OTP for resolved identifier: {}", resolvedId);
            return ResponseEntity.badRequest().body(ApiResponse.err("Invalid or expired OTP. Please try again."));
        }
    }

    private String resolveIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return "";
        }
        
        // If it's a standard email format, use it directly
        if (identifier.contains("@")) {
            return identifier.trim().toLowerCase();
        }
        
        // Clean digits only
        String cleanPhone = identifier.replaceAll("[^0-9]", "");
        if (cleanPhone.isEmpty()) {
            return identifier.trim().toLowerCase(); // fallback
        }
        
        // Extract the last 10 digits as the suffix (handles different prefixes like 91 or +91)
        String suffix = cleanPhone.length() > 10 
                ? cleanPhone.substring(cleanPhone.length() - 10) 
                : cleanPhone;
        
        // Try to look up existing user by matching the last 10 digits of their phone
        return userRepository.findByPhoneSuffix(suffix)
                .map(u -> {
                    return (u.getEmail() != null && !u.getEmail().isBlank()) ? u.getEmail() : u.getPhone();
                })
                .orElseGet(() -> {
                    // If no user exists, the identifier is the formatted phone number
                    return "91" + suffix;
                });
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

    // ── Reset Password ────────────────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        s.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully. You can now log in.", null));
    }
}
