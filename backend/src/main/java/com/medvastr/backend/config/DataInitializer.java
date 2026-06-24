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
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.admin.email:admin@medvastr.com}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Bean
    public CommandLineRunner initAdminUser() {
        return args -> {
            // Modify legacy Hibernate columns to allow NULL to prevent DB constraint insertion crashes
            try {
                jdbcTemplate.execute("ALTER TABLE orders MODIFY subtotal DECIMAL(12,2) NULL");
                log.info("[DataInitializer] Successfully modified orders.subtotal to allow NULL");
            } catch (Exception e) {
                log.debug("[DataInitializer] Could not alter orders.subtotal (likely already updated or doesn't exist): {}", e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE orders MODIFY discount_amount DECIMAL(12,2) NULL");
                log.info("[DataInitializer] Successfully modified orders.discount_amount to allow NULL");
            } catch (Exception e) {
                log.debug("[DataInitializer] Could not alter orders.discount_amount (likely already updated or doesn't exist): {}", e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE orders MODIFY total_amount DECIMAL(12,2) NULL");
                log.info("[DataInitializer] Successfully modified orders.total_amount to allow NULL");
            } catch (Exception e) {
                log.debug("[DataInitializer] Could not alter orders.total_amount (likely already updated or doesn't exist): {}", e.getMessage());
            }

            if (adminPassword == null || adminPassword.isBlank()) {
                log.info("[DataInitializer] ADMIN_INITIAL_PASSWORD not set — skipping admin bootstrap.");
                return;
            }

            if (userRepo.existsByEmail(adminEmail)) {
                log.info("[DataInitializer] Admin {} already exists.", adminEmail);
                return;
            }

            log.info("[DataInitializer] Creating/Updating admin user for: {}", adminEmail);
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("Medvastr")
                    .email(adminEmail)
                    .phone("9999999999")
                    .password(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .emailVerified(true)
                    .active(true)
                    .loyaltyPoints(0)
                    .build();

            userRepo.save(admin);
            log.info("[DataInitializer] Admin user BOOTSTRAPPED successfully for {}", adminEmail);
        };
    }
}
