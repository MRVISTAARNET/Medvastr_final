package com.medvastr.backend.controller;

import com.medvastr.backend.dto.*;
import com.medvastr.backend.repository.UserRepository;
import com.medvastr.backend.service.AuthService;
import com.medvastr.backend.service.EmailService;
import com.medvastr.backend.service.OtpService;
import java.util.UUID;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({ "/api/auth", "/auth" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {

    private final AuthService s;
    private final OtpService otpService;
    private final EmailService emailService;
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
        log.info("[OTP] Request for email: {}", r.getEmail());
        if (!userRepository.existsByEmail(r.getEmail())) {
            log.info("[OTP] Auto-registering new user: {}", r.getEmail());
            RegisterRequest req = new RegisterRequest();
            req.setEmail(r.getEmail());
            req.setFirstName(r.getEmail().split("@")[0]);
            req.setLastName("");
            req.setPassword(UUID.randomUUID().toString()); // random secure pass since it's OTP based
            req.setPhone("");
            s.register(req);
        }
        // OTP service now handles both generation and sending
        otpService.generateAndSendOtp(r.getEmail());
        log.info("[OTP] Code sent to {}", r.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Verification code sent to " + r.getEmail(), null));
    }

    // ── OTP: Verify code and log in ────────────────────────────────────────
    @PostMapping("/otp-login")
    public ResponseEntity<ApiResponse<AuthResponse>> otpLogin(@RequestBody @Valid OtpRequest r) {
        log.info("[OTP] Login attempt for email: {}", r.getEmail());
        if (r.getOtp() == null || r.getOtp().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.err("OTP code is required."));
        }
        if (otpService.validateOtp(r.getEmail(), r.getOtp())) {
            AuthResponse auth = s.loginViaOtp(r.getEmail());
            log.info("[OTP] Login successful for {}", r.getEmail());
            return ResponseEntity.ok(ApiResponse.ok("Login successful", auth));
        } else {
            log.warn("[OTP] Invalid or expired OTP for {}", r.getEmail());
            return ResponseEntity.badRequest().body(ApiResponse.err("Invalid or expired OTP. Please try again."));
        }
    }

    // ── Reset Password ────────────────────────────────────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        s.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully. You can now log in.", null));
    }
}
