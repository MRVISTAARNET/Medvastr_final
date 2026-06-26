package com.medvastr.backend.controller;

import com.medvastr.backend.service.ShiprocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShiprocketService shiprocketService;

    @GetMapping("/serviceability")
    public ResponseEntity<String> getServiceability(
            @RequestParam String pincode,
            @RequestParam double weight,
            @RequestParam boolean isCod) {
        String response = shiprocketService.getServiceability(pincode, weight, isCod);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/track/{awb}")
    public ResponseEntity<String> trackShipment(@PathVariable String awb) {
        String response = shiprocketService.getTrackingDetails(awb);
        return ResponseEntity.ok(response);
    }
}
