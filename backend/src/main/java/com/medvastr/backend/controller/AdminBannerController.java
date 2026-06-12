package com.medvastr.backend.controller;

import com.medvastr.backend.dto.BannerDTO;
import com.medvastr.backend.model.Banner;
import com.medvastr.backend.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminBannerController {
    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<List<BannerDTO>> getAllBanners() {
        List<BannerDTO> banners = bannerService.getAllBanners();
        return ResponseEntity.ok(banners);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBannerById(@PathVariable Long id) {
        try {
            List<BannerDTO> banners = bannerService.getAllBanners();
            BannerDTO banner = banners.stream()
                    .filter(b -> b.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Banner not found"));
            return ResponseEntity.ok(banner);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createBanner(@RequestBody BannerDTO dto) {
        try {
            BannerDTO created = bannerService.createBanner(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating banner: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @RequestBody BannerDTO dto) {
        try {
            BannerDTO updated = bannerService.updateBanner(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating banner: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        try {
            bannerService.deleteBanner(id);
            return ResponseEntity.ok("Banner deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting banner: " + e.getMessage());
        }
    }

    @PostMapping("/reorder")
    public ResponseEntity<?> reorderBanners(@RequestBody List<Long> ids) {
        try {
            bannerService.reorderBanners(ids);
            return ResponseEntity.ok("Banners reordered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error reordering banners: " + e.getMessage());
        }
    }

    @GetMapping("/position/{position}")
    public ResponseEntity<?> getBannersByPosition(@PathVariable String position) {
        try {
            Banner.BannerPosition pos = Banner.BannerPosition.valueOf(position.toUpperCase());
            List<BannerDTO> banners = bannerService.getBannersByPosition(pos);
            return ResponseEntity.ok(banners);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid position: " + e.getMessage());
        }
    }
}
