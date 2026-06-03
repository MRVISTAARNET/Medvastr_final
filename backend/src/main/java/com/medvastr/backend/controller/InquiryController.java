package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.model.Inquiry;
import com.medvastr.backend.repository.InquiryRepository;
import com.medvastr.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
@Slf4j
public class InquiryController {

    private final InquiryRepository inquiryRepository;
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<ApiResponse<Inquiry>> submitInquiry(@RequestBody Inquiry cmd) {
        log.info("Received new inquiry: {}", cmd.getType());

        cmd.setStatus("NEW");
        cmd.setCreatedAt(LocalDateTime.now());

        Inquiry saved = inquiryRepository.save(cmd);

        // Asynchronously send emails to admin and auto-reply to the user!
        try {
            emailService.sendInquiryNotification(saved);
        } catch (Exception e) {
            log.error("Failed to send inquiry notification via email: {}", e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.ok("Inquiry sent successfully", saved));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Inquiry>>> getAllInquiries() {
        return ResponseEntity
                .ok(ApiResponse.ok("Fetched inquiries", inquiryRepository.findAllByOrderByCreatedAtDesc()));
    }
}
