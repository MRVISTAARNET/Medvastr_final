package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminDbController {

    private final JdbcTemplate jdbcTemplate;

    @DeleteMapping("/clean-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> cleanProducts() {
        try {
            log.warn("🚨 CLEANING PRODUCTS DATA");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0;");
            jdbcTemplate.execute("TRUNCATE TABLE reviews;");
            jdbcTemplate.execute("TRUNCATE TABLE product_image;");
            jdbcTemplate.execute("TRUNCATE TABLE product_images;");
            jdbcTemplate.execute("TRUNCATE TABLE product_variant;");
            jdbcTemplate.execute("TRUNCATE TABLE product_variants;");
            jdbcTemplate.execute("TRUNCATE TABLE products;");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1;");
            return ResponseEntity.ok(ApiResponse.ok("Products cleared safely.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.err(e.getMessage()));
        }
    }

    @DeleteMapping("/clean-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> cleanOrders() {
        try {
            log.warn("🚨 CLEANING ORDERS DATA");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0;");
            jdbcTemplate.execute("TRUNCATE TABLE order_items;");
            jdbcTemplate.execute("TRUNCATE TABLE orders;");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1;");
            return ResponseEntity.ok(ApiResponse.ok("Orders cleared safely.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.err(e.getMessage()));
        }
    }

    @DeleteMapping("/clean-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> cleanUsers() {
        try {
            log.warn("🚨 CLEANING USERS DATA (EXCEPT ADMIN)");
            jdbcTemplate.execute("DELETE FROM users WHERE role = 'ROLE_USER'");
            return ResponseEntity.ok(ApiResponse.ok("Non-admin users cleared safely.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.err(e.getMessage()));
        }
    }
}
