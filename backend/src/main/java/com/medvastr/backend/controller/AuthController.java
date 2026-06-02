package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.dto.AuthResponse;
import com.medvastr.backend.dto.LoginRequest;
import com.medvastr.backend.dto.RegisterRequest;
import com.medvastr.backend.dto.ResetPasswordRequest;
import com.medvastr.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.medvastr.backend.dto.OtpRequest;
import com.medvastr.backend.repository.UserRepository;
import com.medvastr.backend.service.EmailService;
import com.medvastr.backend.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({ "/api/auth", "/auth" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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
    // POST /api/auth/forgot-password?email=user@example.com
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam String email) {
        s.forgotPassword(email);
        // Always return success so attackers can't tell if an email exists
        return ResponseEntity.ok(ApiResponse.ok(
                "If this email is registered you will receive a reset link shortly.", null));
    }

    // ── Validate token (front-end checks before showing the reset form) ────
    // GET /api/auth/reset-password/validate?token=xxx
    @GetMapping("/reset-password/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestParam String token) {
        boolean valid = s.validateResetToken(token);
        return ResponseEntity.ok(ApiResponse.ok(valid ? "Token is valid" : "Token invalid or expired", valid));
    }

    // ── OTP LOGIN ──

    @PostMapping("/otp-request")
    public ResponseEntity<ApiResponse<Void>> requestOtp(@RequestBody @Valid OtpRequest r) {
        if (!userRepository.existsByEmail(r.getEmail())) {
            throw new BadCredentialsException("Email not registered");
        }
        String otp = otpService.generateOtp(r.getEmail());
        emailService.sendOtpEmail(r.getEmail(), otp);
        return ResponseEntity.ok(ApiResponse.ok("Verification code sent to " + r.getEmail(), null));
    }

    @PostMapping("/otp-login")
    public ResponseEntity<ApiResponse<AuthResponse>> otpLogin(@RequestBody @Valid OtpRequest r) {
        if (otpService.validateOtp(r.getEmail(), r.getOtp())) {
            return ResponseEntity.ok(ApiResponse.ok("Login successful", s.loginViaOtp(r.getEmail())));
        } else {
            throw new BadCredentialsException("Invalid or expired OTP");
        }
    }

    // ── Reset Password ────────────────────────────────────────────────────────
    // POST /api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        s.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully. You can now log in.", null));
    }
}
