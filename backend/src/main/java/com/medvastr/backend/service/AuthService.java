package com.medvastr.backend.service;

import com.medvastr.backend.config.JwtUtils;
import com.medvastr.backend.dto.AuthResponse;
import com.medvastr.backend.dto.LoginRequest;
import com.medvastr.backend.dto.RegisterRequest;
import com.medvastr.backend.dto.ResetPasswordRequest;
import com.medvastr.backend.dto.UserDTO;
import com.medvastr.backend.model.PasswordResetToken;
import com.medvastr.backend.model.User;
import com.medvastr.backend.repository.PasswordResetTokenRepository;
import com.medvastr.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwt;
    private final AuthenticationManager authManager;
    private final PasswordResetTokenRepository resetTokenRepo;
    private final EmailService emailService;

    // ── Register ─────────────────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest r) {
        if (userRepo.existsByEmail(r.getEmail()))
            throw new RuntimeException("Email already registered");

        User u = User.builder()
                .firstName(r.getFirstName())
                .lastName(r.getLastName())
                .email(r.getEmail())
                .phone(r.getPhone())
                .password(encoder.encode(r.getPassword()))
                .build();
        userRepo.save(u);
        return buildResponse(u);
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest r) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(r.getEmail(), r.getPassword()));
        return buildResponse(userRepo.findByEmail(r.getEmail()).orElseThrow());
    }

    // ── Forgot password: generates token → sends email ───────────────────────
    public void forgotPassword(String email) {
        // Always return success even if email not found (prevents user-enumeration)
        userRepo.findByEmail(email).ifPresent(user -> {
            // Delete any previous tokens for this email
            resetTokenRepo.deleteByEmail(email);

            // Create a cryptographically-secure 48-byte URL-safe token
            byte[] bytes = new byte[48];
            new SecureRandom().nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

            PasswordResetToken prt = PasswordResetToken.builder()
                    .token(token)
                    .email(email)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .used(false)
                    .build();
            resetTokenRepo.save(prt);

            // Send the styled email (async – does not block this thread)
            emailService.sendPasswordResetEmail(email, token);
            log.info("[AuthService] Password reset token created for {}", email);
        });
    }

    // ── Reset password: validates token → updates password ───────────────────
    public void resetPassword(ResetPasswordRequest req) {
        PasswordResetToken prt = resetTokenRepo.findByToken(req.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link."));

        if (prt.isUsed())
            throw new RuntimeException("This reset link has already been used.");

        if (prt.isExpired())
            throw new RuntimeException("This reset link has expired. Please request a new one.");

        User user = userRepo.findByEmail(prt.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found."));

        user.setPassword(encoder.encode(req.getNewPassword()));
        userRepo.save(user);

        // Mark token as used so it can't be replayed
        prt.setUsed(true);
        resetTokenRepo.save(prt);

        log.info("[AuthService] Password successfully reset for {}", prt.getEmail());
    }

    // ── Validate token (used by front-end to pre-check the link) ─────────────
    public boolean validateResetToken(String token) {
        return resetTokenRepo.findByToken(token)
                .map(t -> !t.isUsed() && !t.isExpired())
                .orElse(false);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private AuthResponse buildResponse(User u) {
        return AuthResponse.builder()
                .token(jwt.generate(u.getEmail()))
                .expiresIn(jwt.getExpMs())
                .user(toDTO(u))
                .build();
    }

    public UserDTO toDTO(User u) {
        return UserDTO.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .emailVerified(u.isEmailVerified())
                .loyaltyPoints(u.getLoyaltyPoints())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
