package com.medvastr.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(c -> c.disable())
                .cors(c -> c.configurationSource(corsSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/api/auth/**", "/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health", "/health", "/").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/products/**",
                                "/api/categories/**", "/categories/**",
                                "/api/search/**", "/search/**",
                                "/api/settings/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/track/**", "/orders/track/**").permitAll()
                        .requestMatchers("/api/payments/webhook", "/payments/webhook").permitAll()
                        .requestMatchers("/api/newsletter/**", "/newsletter/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/inquiries").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/media/**").permitAll()
                        .requestMatchers("/api/upload").hasRole("ADMIN")
                        .requestMatchers("/api/debug/**", "/debug/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/orders", "/orders").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/orders", "/orders").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/orders/verify-payment", "/orders/verify-payment")
                        .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/orders/*/cancel", "/orders/*/cancel").authenticated()
                        .requestMatchers("/api/admin/**", "/admin/**", "/api/users/**", "/users/**")
                        .hasRole("ADMIN")
                        .requestMatchers("/api/orders/admin/**", "/orders/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/**", "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**", "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/settings/**", "/settings/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/inquiries", "/inquiries").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/inquiries/**", "/inquiries/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .exceptionHandling(e -> e.authenticationEntryPoint((req, res, ex) -> {
                    res.setStatus(401);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"success\":false,\"message\":\"Unauthorized\"}");
                }))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration c) throws Exception {
        return c.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        var c = new CorsConfiguration();
        // Use allowedOriginPatterns("*") - works with allowCredentials(false)
        c.setAllowedOriginPatterns(Arrays.asList("*"));
        c.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        c.setAllowedHeaders(Arrays.asList("*"));
        c.setExposedHeaders(Arrays.asList("Authorization"));
        c.setAllowCredentials(false);
        c.setMaxAge(3600L);
        var src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", c);
        return src;
    }
}
