package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.service.ShiprocketService;
import com.medvastr.backend.repository.OrderRepository;
import com.medvastr.backend.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/debug/shiprocket")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ShiprocketDebugController {

    private final ShiprocketService shiprocketService;
    private final OrderRepository orderRepo;

    @GetMapping("/test/{orderNum}")
    public ResponseEntity<ApiResponse<String>> testOrder(@PathVariable String orderNum) {
        Order o = orderRepo.findByOrderNumber(orderNum).orElse(null);
        if (o == null)
            return ResponseEntity.ok(ApiResponse.err("Order not found: " + orderNum));

        // Manual trigger (Sync for debugging)
        o.getItems().forEach(i -> {
            if (i.getProduct() != null)
                i.getProduct().getName();
        });
        o.getUser().getEmail();

        shiprocketService.createOrder(o);

        return ResponseEntity
                .ok(ApiResponse.ok("Triggered Shiprocket push for " + orderNum + ". Check server logs.", null));
    }
}
