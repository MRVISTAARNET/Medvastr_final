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
                log.info("[DataInitializer] Admin user already exists — updating password to ensure access.");
                User existingAdmin = userRepo.findByEmail(adminEmail).orElseThrow();
                existingAdmin.setPassword(passwordEncoder.encode("Admin@123"));
                existingAdmin.setActive(true);
                userRepo.save(existingAdmin);
                return;
            }

            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("Medvastr")
                    .email(adminEmail)
                    .phone("9920314164")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(User.Role.ADMIN)
                    .emailVerified(true)
                    .active(true)
                    .loyaltyPoints(0)
                    .build();

            userRepo.save(admin);

            // Break-glass account
            if (!userRepo.existsByEmail("root@medvastr.com")) {
                User root = User.builder()
                        .firstName("Root")
                        .lastName("Admin")
                        .email("root@medvastr.com")
                        .phone("0000000000")
                        .password(passwordEncoder.encode("root123"))
                        .role(User.Role.ADMIN)
                        .emailVerified(true)
                        .active(true)
                        .build();
                userRepo.save(root);
                log.info("[DataInitializer] ✅ Break-glass account created: root@medvastr.com / root123");
            }
            log.info("[DataInitializer] ✅ Default admin user created — email: {}", adminEmail);
            log.info("[DataInitializer] ✅ Default admin user created — email: {}", adminEmail);
        };
    }
}
