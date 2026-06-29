package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.model.StoreSetting;
import com.medvastr.backend.repository.StoreSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.medvastr.backend.service.RazorpayService;
import java.util.Map;

@RestController
@RequestMapping({ "/api/settings", "/settings" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SettingsController {

    private final StoreSettingRepository repo;
    private final RazorpayService razorpayService;

    /** Public read - used by Hero, VideoSection, etc. */
    @GetMapping("/{key}")
    public ResponseEntity<ApiResponse<String>> get(@PathVariable String key) {
        return repo.findById(key)
                .map(s -> ResponseEntity.ok(ApiResponse.ok("Setting", s.getSettingValue())))
                .orElse(ResponseEntity.ok(ApiResponse.<String>ok("Setting", null)));
    }

    /** Returns the active Razorpay public key (from DB override or EB env var) */
    @GetMapping("/razorpay-public-key")
    public ResponseEntity<ApiResponse<String>> getRazorpayPublicKey() {
        return ResponseEntity.ok(ApiResponse.ok("Razorpay Key", razorpayService.getKeyId()));
    }

    /** Admin write - save or update any setting */
    @PostMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> set(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        String value = body.get("value");
        StoreSetting setting = repo.findById(key)
                .orElse(StoreSetting.builder().settingKey(key).build());
        setting.setSettingValue(value);
        repo.save(setting);
        return ResponseEntity.ok(ApiResponse.ok("Saved", value));
    }
}
