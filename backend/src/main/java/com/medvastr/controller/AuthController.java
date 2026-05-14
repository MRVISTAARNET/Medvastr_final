package com.medvastr.controller;

import com.medvastr.dto.ApiResponse;
import com.medvastr.dto.AuthResponse;
import com.medvastr.dto.LoginRequest;
import com.medvastr.dto.RegisterRequest;
import com.medvastr.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService s;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest r) {
        return ResponseEntity.status(201).body(ApiResponse.ok("Registered", s.register(r)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest r) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful", s.login(r)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgot(@RequestParam String email) {
        s.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.ok("Email sent", null));
    }
}
