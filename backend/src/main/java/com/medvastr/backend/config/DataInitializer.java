package com.medvastr.backend.config;

import com.medvastr.backend.model.PromoCode;
import com.medvastr.backend.model.User;
import com.medvastr.backend.repository.PromoCodeRepository;
import com.medvastr.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepo;
    private final PromoCodeRepository promoRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:info@medvarn.com}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Bean
    public CommandLineRunner initAdminUser() {
        return args -> {
            if (adminPassword != null && !adminPassword.isBlank()) {
                User admin = userRepo.findByEmail(adminEmail).orElseGet(() -> {
                    log.info("[DataInitializer] Creating admin user for: {}", adminEmail);
                    return User.builder()
                            .firstName("Admin")
                            .lastName("Medvarn")
                            .email(adminEmail)
                            .phone("9999999999")
                            .emailVerified(true)
                            .loyaltyPoints(0)
                            .build();
                });
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(User.Role.ADMIN);
                admin.setActive(true);
                userRepo.save(admin);
                log.info("[DataInitializer] Admin user synced/bootstrapped successfully for {}", adminEmail);
            }

            // Seed default MEDVARN10 & MEDVASTR10 promo codes
            if (!promoRepo.existsByCodeIgnoreCase("MEDVARN10")) {
                promoRepo.save(PromoCode.builder()
                        .code("MEDVARN10")
                        .description("10% Welcome Discount for Medvarn")
                        .discountType(PromoCode.DiscountType.PERCENTAGE)
                        .discountValue(BigDecimal.TEN)
                        .minimumOrderAmount(BigDecimal.ZERO)
                        .usedCount(0)
                        .active(true)
                        .build());
                log.info("[DataInitializer] Seeded MEDVARN10 promo code");
            }
            if (!promoRepo.existsByCodeIgnoreCase("MEDVASTR10")) {
                promoRepo.save(PromoCode.builder()
                        .code("MEDVASTR10")
                        .description("10% Discount Code")
                        .discountType(PromoCode.DiscountType.PERCENTAGE)
                        .discountValue(BigDecimal.TEN)
                        .minimumOrderAmount(BigDecimal.ZERO)
                        .usedCount(0)
                        .active(true)
                        .build());
                log.info("[DataInitializer] Seeded MEDVASTR10 promo code");
            }
        };
    }
}
