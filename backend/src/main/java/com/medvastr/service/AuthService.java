package com.medvastr.service;

import com.medvastr.config.JwtUtils;
import com.medvastr.dto.AuthResponse;
import com.medvastr.dto.LoginRequest;
import com.medvastr.dto.RegisterRequest;
import com.medvastr.dto.UserDTO;
import com.medvastr.model.User;
import com.medvastr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwt;
    private final AuthenticationManager authManager;

    public AuthResponse register(RegisterRequest r) {
        if (userRepo.existsByEmail(r.getEmail())) throw new RuntimeException("Email already registered");
        User u = User.builder()
            .firstName(r.getFirstName())
            .lastName(r.getLastName())
            .email(r.getEmail())
            .phone(r.getPhone())
            .password(encoder.encode(r.getPassword()))
            .build();
        userRepo.save(u);
        return build(u);
    }

    public AuthResponse login(LoginRequest r) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(r.getEmail(), r.getPassword()));
        return build(userRepo.findByEmail(r.getEmail()).orElseThrow());
    }

    public void forgotPassword(String email) {
        log.info("Password reset: {}", email);
    }

    private AuthResponse build(User u) {
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

