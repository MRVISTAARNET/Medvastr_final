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
    private final com.medvastr.backend.repository.OrderRepository orderRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwt;
    private final AuthenticationManager authManager;
    private final PasswordResetTokenRepository resetTokenRepo;
    private final EmailService emailService;

    // ── Register ─────────────────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest r) {
        if (r.getEmail() != null && !r.getEmail().isBlank() && userRepo.existsByEmail(r.getEmail()))
            throw new RuntimeException("Email already registered");

        User u = User.builder()
                .firstName(
                        r.getFirstName() == null || r.getFirstName().trim().isEmpty()
                                ? "User"
                                : r.getFirstName())
                .lastName(
                        r.getLastName() == null || r.getLastName().trim().isEmpty()
                                ? "User"
                                : r.getLastName())
                .email(r.getEmail())
                .phone(r.getPhone())
                .password(encoder.encode(r.getPassword()))
                .build();
        userRepo.save(u);

        try {
            if (u.getEmail() != null && !u.getEmail().isBlank()) {
                emailService.sendWelcomeEmail(u.getEmail(), u.getFirstName());
            }
        } catch (Exception ex) {
            log.error("Failed to send welcome email during registration for {}", u.getEmail(), ex);
        }

        return buildResponse(u);
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest r) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(r.getEmail(), r.getPassword()));
        return buildResponse(userRepo.findByEmail(r.getEmail()).orElseThrow());
    }

    public AuthResponse loginViaOtp(String emailOrPhone) {
        User u;
        if (emailOrPhone.contains("@")) {
            u = userRepo.findByEmail(emailOrPhone)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else {
            String cleanPhone = emailOrPhone.replaceAll("[^0-9]", "");
            String suffix = cleanPhone.length() > 10 
                    ? cleanPhone.substring(cleanPhone.length() - 10) 
                    : cleanPhone;
            u = userRepo.findByPhoneSuffix(suffix)
                    .orElseGet(() -> {
                        // Check if an existing User account has an order with this phone
                        var matchingOrders = orderRepo.findRecentWithUserByPhoneSuffix(suffix);
                        if (!matchingOrders.isEmpty()) {
                            User primaryUser = matchingOrders.get(0).getUser();
                            if (primaryUser != null) {
                                if (primaryUser.getPhone() == null || primaryUser.getPhone().isBlank()) {
                                    primaryUser.setPhone(cleanPhone);
                                    userRepo.save(primaryUser);
                                }
                                log.info("[AuthService] Linked OTP phone {} to primary email account {}", cleanPhone, primaryUser.getEmail());
                                return primaryUser;
                            }
                        }
                        
                        // Create user if no existing user found
                        User newUser = User.builder()
                                .firstName("User")
                                .lastName("User")
                                .phone(cleanPhone)
                                .emailVerified(true)
                                .active(true)
                                .password(encoder.encode(java.util.UUID.randomUUID().toString()))
                                .build();
                        return userRepo.save(newUser);
                    });
        }
        
        if (!u.isEmailVerified()) {
            u.setEmailVerified(true);
            userRepo.save(u);
            log.info("[AuthService] Email/Phone auto-verified via OTP for {}", emailOrPhone);
        }
        return buildResponse(u);
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

    // ── Google Authentication ───────────────────────────────────────────────────
    public AuthResponse loginViaGoogle(String idToken) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> payload = restTemplate.getForObject(url, java.util.Map.class);

            if (payload == null || !payload.containsKey("email")) {
                throw new RuntimeException("Invalid or expired Google credential token.");
            }

            String email = (String) payload.get("email");
            String gGivenName = (String) payload.get("given_name");
            String gFamilyName = (String) payload.get("family_name");
            String gFullName = (String) payload.get("name");

            String firstName = gGivenName;
            String lastName = gFamilyName != null ? gFamilyName : "";

            if ((firstName == null || firstName.isBlank()) && gFullName != null && !gFullName.isBlank()) {
                String[] parts = gFullName.trim().split("\\s+");
                firstName = parts[0];
                if (parts.length > 1) {
                    lastName = String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length));
                }
            }

            if (firstName == null || firstName.isBlank() || firstName.equalsIgnoreCase("Google")) {
                if (email != null && email.contains("@")) {
                    String prefix = email.substring(0, email.indexOf("@"));
                    if (!prefix.isEmpty()) {
                        firstName = prefix.substring(0, 1).toUpperCase() + prefix.substring(1);
                    } else {
                        firstName = "Customer";
                    }
                } else {
                    firstName = "Customer";
                }
            }

            final String resolvedFirstName = firstName;
            final String resolvedLastName = lastName;

            User u = userRepo.findByEmail(email).orElseGet(() -> {
                User newUser = User.builder()
                        .firstName(resolvedFirstName)
                        .lastName(resolvedLastName)
                        .email(email)
                        .emailVerified(true)
                        .active(true)
                        .password(encoder.encode(java.util.UUID.randomUUID().toString()))
                        .build();
                return userRepo.save(newUser);
            });

            boolean updated = false;
            if (u.getFirstName() == null || u.getFirstName().isBlank() || u.getFirstName().equalsIgnoreCase("Google") || (u.getFirstName() + " " + u.getLastName()).toLowerCase().contains("medvastr user")) {
                u.setFirstName(resolvedFirstName);
                u.setLastName(resolvedLastName);
                updated = true;
            }
            if (!u.isEmailVerified()) {
                u.setEmailVerified(true);
                updated = true;
            }
            if (updated) {
                userRepo.save(u);
            }

            log.info("[AuthService] Google login successful for user {}", email);
            return buildResponse(u);
        } catch (Exception ex) {
            log.error("[AuthService] Google login verification failed", ex);
            throw new RuntimeException("Google sign-in failed. Please try again.");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private AuthResponse buildResponse(User u) {
        String subject = (u.getEmail() != null && !u.getEmail().isBlank()) ? u.getEmail() : u.getPhone();
        return AuthResponse.builder()
                .token(jwt.generate(subject))
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
