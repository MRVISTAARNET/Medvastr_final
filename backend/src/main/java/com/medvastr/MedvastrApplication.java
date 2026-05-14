package com.medvastr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MedvastrApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedvastrApplication.class, args);
        System.out.println("""
            ╔══════════════════════════════════════╗
            ║   Medvastr Backend Started ✅          ║
            ║   API: http://localhost:8080/api      ║
            ╚══════════════════════════════════════╝
            """);
    }
}
