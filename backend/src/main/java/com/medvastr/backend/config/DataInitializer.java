package com.medvastr.backend.config;

import com.medvastr.backend.model.User;
import com.medvastr.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Auto-creates the default admin user with a BCrypt-hashed password
 * on every application start-up. If the admin already exists, it does nothing.
 * This means you NEVER have to run a manual mysql UPDATE command again.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initAdminUser() {
        return args -> {
            final String adminEmail = "admin@medvastr.com";

            if (userRepo.existsByEmail(adminEmail)) {
                log.info("[DataInitializer] Admin user already exists — skipping creation.");
                return;
            }

            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("Medvastr")
                    .email(adminEmail)
                    .phone("9920314164")
                    // BCrypt hash is generated here with the same encoder Spring Security uses for
                    // login
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(User.Role.ADMIN)
                    .emailVerified(true)
                    .active(true)
                    .loyaltyPoints(0)
                    .build();

            userRepo.save(admin);
            log.info("[DataInitializer] ✅ Default admin user created — email: {}", adminEmail);
        };
    }
}
