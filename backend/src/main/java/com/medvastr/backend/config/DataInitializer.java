package com.medvastr.backend.config;

import com.medvastr.backend.model.Category;
import com.medvastr.backend.model.PromoCode;
import com.medvastr.backend.model.User;
import com.medvastr.backend.repository.CategoryRepository;
import com.medvastr.backend.repository.PromoCodeRepository;
import com.medvastr.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepo;
    private final PromoCodeRepository promoRepo;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepo;
    private final JdbcTemplate jdbcTemplate;

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

            // Seed Doctor Apron / Lab Coat categories idempotently if not exist
            try {
                if (categoryRepo.findBySlug("men-doctor-apron-lab-coat").isEmpty()) {
                    categoryRepo.findBySlug("men").ifPresent(menCat -> {
                        categoryRepo.save(Category.builder()
                                .name("Doctor Apron / Lab Coat")
                                .slug("men-doctor-apron-lab-coat")
                                .parent(menCat)
                                .active(true)
                                .showInNav(true)
                                .displayOrder(5)
                                .build());
                        log.info("[DataInitializer] Seeded men-doctor-apron-lab-coat category");
                    });
                }
                if (categoryRepo.findBySlug("women-doctor-apron-lab-coat").isEmpty()) {
                    categoryRepo.findBySlug("women").ifPresent(womenCat -> {
                        categoryRepo.save(Category.builder()
                                .name("Doctor Apron / Lab Coat")
                                .slug("women-doctor-apron-lab-coat")
                                .parent(womenCat)
                                .active(true)
                                .showInNav(true)
                                .displayOrder(5)
                                .build());
                        log.info("[DataInitializer] Seeded women-doctor-apron-lab-coat category");
                    });
                }
            } catch (Exception ex) {
                log.warn("[DataInitializer] Could not seed categories: {}", ex.getMessage());
            }

            // Correct any variants or images added with Milky White or White to have #ffffff
            try {
                jdbcTemplate.update("UPDATE product_variants SET color_hex = '#ffffff' WHERE LOWER(TRIM(color_name)) IN ('milky white', 'milky-white', 'milk white', 'white', 'pure white', 'doctor white') AND (color_hex IS NULL OR LOWER(color_hex) IN ('#6b7280', '#808080', '#cccccc'))");
                jdbcTemplate.update("UPDATE product_images SET color_hex = '#ffffff', color_code = '#ffffff' WHERE (LOWER(color_hex) = '#6b7280' OR LOWER(color_code) = '#6b7280') AND product_id IN (SELECT DISTINCT product_id FROM product_variants WHERE LOWER(TRIM(color_name)) IN ('milky white', 'milky-white', 'milk white', 'white', 'pure white', 'doctor white'))");
                log.info("[DataInitializer] Corrected Milky White / White color hex codes in product variants");
            } catch (Exception ex) {
                log.warn("[DataInitializer] Could not update Milky White variant hex: {}", ex.getMessage());
            }
        };
    }
}
