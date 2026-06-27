package com.medvastr.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Value("${springdoc.api-docs.enabled:true}")
    private boolean apiDocsEnabled;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(c -> c.disable())
                .cors(c -> c.configurationSource(corsConfigurationSource))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .contentTypeOptions(c -> {
                        })
                        .frameOptions(f -> f.deny())
                        .referrerPolicy(r -> r
                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicy(p -> p.policy("geolocation=(), microphone=(), camera=()")))
                .authorizeHttpRequests(a -> {
                    a.requestMatchers("/api/auth/**", "/auth/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/health", "/health", "/").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/products/**", "/products/**",
                                    "/api/categories/**", "/categories/**",
                                    "/api/search/**", "/search/**",
                                    "/api/settings/**", "/settings/**",
                                    "/api/banners/**", "/banners/**",
                                    "/api/collections/**", "/collections/**",
                                    "/api/bulk-orders/**", "/bulk-orders/**",
                                    "/api/nav/**", "/nav/**",
                                    "/api/colors/**", "/colors/**",
                                    "/api/sizes/**", "/sizes/**",
                                    "/api/blog/**", "/blog/**",
                                    "/api/attributes/**", "/attributes/**",
                                    "/api/promos/**", "/promos/**",
                                    "/api/shipping/**", "/shipping/**")
                            .permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/orders/track/**", "/orders/track/**").permitAll()
                            .requestMatchers("/api/payments/webhook", "/payments/webhook").permitAll()
                            .requestMatchers("/api/v1/tracking/updates", "/v1/tracking/updates").permitAll()
                            .requestMatchers("/api/newsletter/**", "/newsletter/**").permitAll()
                            .requestMatchers(HttpMethod.POST, "/api/inquiries", "/inquiries").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/media/**").permitAll()
                            .requestMatchers("/api/upload").hasRole("ADMIN")
                            .requestMatchers("/api/debug/**", "/debug/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.POST, "/api/orders", "/orders").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/orders", "/orders").authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/orders/verify-payment", "/orders/verify-payment")
                            .authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/orders/*/cancel", "/orders/*/cancel")
                            .authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/payments/create-order", "/payments/create-order")
                            .authenticated()
                            .requestMatchers(HttpMethod.POST, "/api/payments/verify", "/payments/verify")
                            .authenticated()
                            .requestMatchers("/api/cart/**", "/cart/**").authenticated()
                            .requestMatchers("/api/users/me/**", "/users/me/**").authenticated()
                            .requestMatchers(HttpMethod.GET, "/api/users", "/users").hasRole("ADMIN")
                            .requestMatchers("/api/admin/**", "/admin/**").hasRole("ADMIN")
                            .requestMatchers("/api/orders/admin/**", "/orders/admin/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.POST, "/api/products/**", "/products/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.PUT, "/api/products/**", "/products/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/products/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.POST, "/api/settings/**", "/settings/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.GET, "/api/inquiries/**", "/inquiries/**").hasRole("ADMIN");

                    if (apiDocsEnabled) {
                        a.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll();
                    } else {
                        a.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").denyAll();
                    }

                    a.anyRequest().authenticated();
                })
                .exceptionHandling(e -> e.authenticationEntryPoint((req, res, ex) -> {
                    res.setStatus(401);
                    res.setContentType("application/json");
                    res.getWriter().write("{\"success\":false,\"message\":\"Unauthorized\"}");
                }))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration c) throws Exception {
        return c.getAuthenticationManager();
    }
}
