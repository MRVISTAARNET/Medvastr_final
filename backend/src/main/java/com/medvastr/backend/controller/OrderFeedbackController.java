package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.dto.OrderFeedbackDTO;
import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderFeedback;
import com.medvastr.backend.repository.OrderFeedbackRepository;
import com.medvastr.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/orders/feedback")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OrderFeedbackController {

    private final OrderFeedbackRepository feedbackRepo;
    private final OrderRepository orderRepo;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderFeedbackDTO>> submitFeedback(@RequestBody OrderFeedbackDTO dto) {
        if (dto.getOrderNumber() == null || dto.getOrderNumber().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.err("Order number is required"));
        }
        if (dto.getRating() == null || dto.getRating() < 0 || dto.getRating() > 10) {
            return ResponseEntity.badRequest().body(ApiResponse.err("Rating must be between 0 and 10"));
        }

        // Check if feedback already exists for this order
        Optional<OrderFeedback> existing = feedbackRepo.findByOrderNumber(dto.getOrderNumber());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.err("Feedback already submitted for this order"));
        }

        // Find the order to get customer details
        Order order = orderRepo.findByOrderNumber(dto.getOrderNumber()).orElse(null);
        String name = "Guest Customer";
        String email = "guest@medvastr.com";
        if (order != null) {
            name = order.getShippingName();
            if (order.getUser() != null) {
                email = order.getUser().getEmail();
            } else if (order.getShippingPhone() != null && !order.getShippingPhone().isBlank()) {
                email = order.getShippingPhone(); // Fallback if no email is bound
            }
        }

        OrderFeedback feedback = OrderFeedback.builder()
                .orderNumber(dto.getOrderNumber())
                .rating(dto.getRating())
                .remarks(dto.getRemarks())
                .customerName(name)
                .customerEmail(email)
                .build();

        OrderFeedback saved = feedbackRepo.save(feedback);
        log.info("Feedback submitted for order: {}", dto.getOrderNumber());

        OrderFeedbackDTO result = OrderFeedbackDTO.builder()
                .id(saved.getId())
                .orderNumber(saved.getOrderNumber())
                .rating(saved.getRating())
                .remarks(saved.getRemarks())
                .customerName(saved.getCustomerName())
                .customerEmail(saved.getCustomerEmail())
                .createdAt(saved.getCreatedAt())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Feedback submitted successfully", result));
    }

    @GetMapping("/check/{orderNumber}")
    public ResponseEntity<ApiResponse<Boolean>> checkFeedback(@PathVariable String orderNumber) {
        boolean exists = feedbackRepo.findByOrderNumber(orderNumber).isPresent();
        return ResponseEntity.ok(ApiResponse.ok("Feedback check", exists));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderFeedback>>> getAllFeedbacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<OrderFeedback> result = feedbackRepo.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(ApiResponse.ok("All feedbacks", result));
    }
}
