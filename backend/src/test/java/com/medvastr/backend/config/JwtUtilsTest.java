package com.medvastr.backend.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private final JwtUtils jwtUtils = new JwtUtils();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtUtils, "secret", "test-jwt-secret-key-minimum-32-bytes-long!!");
        ReflectionTestUtils.setField(jwtUtils, "expMs", 3_600_000L);
        jwtUtils.init();
    }

    @Test
    void generatesAndValidatesToken() {
        String token = jwtUtils.generate("user@medvastr.com");
        assertNotNull(token);
        assertTrue(jwtUtils.isValid(token));
        assertEquals("user@medvastr.com", jwtUtils.getEmail(token));
    }

    @Test
    void rejectsTamperedToken() {
        String token = jwtUtils.generate("user@medvastr.com") + "x";
        assertFalse(jwtUtils.isValid(token));
    }
}
