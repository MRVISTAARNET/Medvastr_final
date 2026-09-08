package com.medvastr.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:https://www.medvarn.com,https://medvarn.com,https://api.medvarn.com,https://api.medvastr.com,https://medvastr.com,http://localhost:3000,http://localhost:3001}")
    private String allowedOriginsProp;

    private static final List<String> DEFAULT_ORIGINS = List.of(
            "https://www.medvarn.com",
            "https://medvarn.com",
            "https://api.medvarn.com",
            "https://api.medvastr.com",
            "https://medvastr.com",
            "http://localhost:3000",
            "http://localhost:3001"
    );

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = new ArrayList<>(DEFAULT_ORIGINS);

        if (allowedOriginsProp != null && !allowedOriginsProp.trim().isEmpty()) {
            List<String> parsed = Arrays.stream(allowedOriginsProp.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            for (String origin : parsed) {
                if (!origins.contains(origin)) {
                    origins.add(origin);
                }
            }
        }

        var config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedOriginPatterns(List.of(
                "https://*.medvarn.com",
                "https://medvarn.com",
                "https://*.medvastr.com",
                "https://medvastr.com",
                "http://localhost:*"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "Cache-Control"
        ));
        config.setExposedHeaders(List.of("Authorization", "Link", "X-Total-Count"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean(CorsConfigurationSource corsConfigurationSource) {
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(corsConfigurationSource));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
