package com.medvastr.backend.config;

import com.medvastr.backend.model.User;
import com.medvastr.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@medvastr.com}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Bean
    public CommandLineRunner initAdminUser() {
        return args -> {
            if (adminPassword == null || adminPassword.isBlank()) {
                log.info("[DataInitializer] ADMIN_INITIAL_PASSWORD not set — skipping admin bootstrap.");
                return;
            }

            if (userRepo.existsByEmail(adminEmail)) {
                log.info("[DataInitializer] Admin user already exists — skipping creation.");
                return;
            }

            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("Medvastr")
                    .email(adminEmail)
                    .phone("")
                    .password(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .emailVerified(true)
                    .active(true)
                    .loyaltyPoints(0)
                    .build();

            userRepo.save(admin);
            log.info("[DataInitializer] Admin user created for {}", adminEmail);
        };
    }
}
