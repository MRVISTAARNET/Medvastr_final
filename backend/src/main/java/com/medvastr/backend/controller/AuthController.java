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

@RestController
@RequestMapping({ "/api/auth", "/auth" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService s;

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

    // ── Reset Password ────────────────────────────────────────────────────────
    // POST /api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        s.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully. You can now log in.", null));
    }
}
