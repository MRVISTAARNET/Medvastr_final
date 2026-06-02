package com.medvastr.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadDir = new File("uploads").getAbsolutePath() + "/";

        // Map requests to /api/media/** to the local /uploads/ directory
        registry.addResourceHandler("/api/media/**")
                .addResourceLocations("file:" + uploadDir);
    }
}
