package com.medvastr.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DbFix {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixSchema() {
        try {
            log.info("[DbFix] 🛠️ Manually fixing orders table schema...");

            // Log current schema for debugging
            List<Map<String, Object>> columns = jdbcTemplate.queryForList("SHOW COLUMNS FROM orders");
            for (Map<String, Object> column : columns) {
                log.info("[DbFix] Status: Column {} is type {}", column.get("Field"), column.get("Type"));
            }

            // Forced conversion to VARCHAR
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(30)");
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(30)");
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(30)");

            log.info("[DbFix] ✅ Database schema updated successfully.");
        } catch (Exception e) {
            log.warn("[DbFix] ⚠️ Schema update failed: {}", e.getMessage());
        }
    }
}
