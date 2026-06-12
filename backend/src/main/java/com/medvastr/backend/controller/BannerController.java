package com.medvastr.backend.controller;

import com.medvastr.backend.dto.BannerDTO;
import com.medvastr.backend.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BannerController {
    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<List<BannerDTO>> getAllBanners() {
        List<BannerDTO> banners = bannerService.getAllActiveBanners();
        return ResponseEntity.ok(banners);
    }

    @GetMapping("/position/{position}")
    public ResponseEntity<List<BannerDTO>> getBannersByPosition(@PathVariable String position) {
        try {
            com.medvastr.backend.model.Banner.BannerPosition pos = 
                    com.medvastr.backend.model.Banner.BannerPosition.valueOf(position.toUpperCase());
            List<BannerDTO> banners = bannerService.getBannersByPosition(pos);
            return ResponseEntity.ok(banners);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
