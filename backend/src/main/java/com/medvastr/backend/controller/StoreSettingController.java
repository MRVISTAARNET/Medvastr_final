package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.model.StoreSetting;
import com.medvastr.backend.repository.StoreSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class StoreSettingController {

    private final StoreSettingRepository reqRepo;

    @GetMapping("/{key}")
    public ResponseEntity<ApiResponse<String>> getSetting(@PathVariable String key) {
        java.util.Optional<StoreSetting> opt = reqRepo.findById(key);
        if (opt.isPresent()) {
            return ResponseEntity.ok(ApiResponse.ok("Got setting", opt.get().getSettingValue()));
        } else {
            return ResponseEntity.ok(ApiResponse.ok("Setting not found", null));
        }
    }

    @PostMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateSetting(@PathVariable String key,
            @RequestBody Map<String, String> body) {
        String val = body.get("value");
        StoreSetting s = reqRepo.findById(key).orElse(new StoreSetting());
        s.setSettingKey(key);
        s.setSettingValue(val);
        reqRepo.save(s);
        return ResponseEntity.ok(ApiResponse.ok("Setting updated", s.getSettingValue()));
    }
}
