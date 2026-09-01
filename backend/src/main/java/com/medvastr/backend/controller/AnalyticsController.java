package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.dto.AnalyticsDTOs.*;
import com.medvastr.backend.model.User;
import com.medvastr.backend.repository.UserRepository;
import com.medvastr.backend.service.AnalyticsService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping({ "/api/analytics", "/analytics" })
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepo;

    private User getAuthenticatedUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                String principal = auth.getName();
                return userRepo.findByEmail(principal).orElse(null);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Public non-blocking tracking endpoint.
     */
    @PostMapping("/track")
    public ResponseEntity<ApiResponse<String>> track(@RequestBody TrackRequest req, HttpServletRequest request) {
        String ip = getClientIp(request);
        String ua = request.getHeader("User-Agent");
        User user = getAuthenticatedUser();

        analyticsService.track(req, ip, ua, user);
        return ResponseEntity.ok(ApiResponse.ok("Tracked", "OK"));
    }

    /**
     * Admin Overview Metrics.
     */
    @GetMapping("/admin/overview")
    public ResponseEntity<ApiResponse<AnalyticsOverviewDTO>> getOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        return ResponseEntity.ok(ApiResponse.ok("Analytics Overview", analyticsService.getOverview(start, end)));
    }

    /**
     * Admin Daily Trends.
     */
    @GetMapping("/admin/trends")
    public ResponseEntity<ApiResponse<List<DailyTrendItem>>> getTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        return ResponseEntity.ok(ApiResponse.ok("Daily Trends", analyticsService.getDailyTrends(start, end)));
    }

    /**
     * Admin Traffic Sources Breakdown.
     */
    @GetMapping("/admin/traffic")
    public ResponseEntity<ApiResponse<List<TrafficSourceItem>>> getTraffic(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        return ResponseEntity.ok(ApiResponse.ok("Traffic Report", analyticsService.getTrafficReport(start, end)));
    }

    /**
     * Admin Top Visited Pages.
     */
    @GetMapping("/admin/pages")
    public ResponseEntity<ApiResponse<List<TopPageItem>>> getPages(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        return ResponseEntity.ok(ApiResponse.ok("Top Pages Report", analyticsService.getTopPages(start, end)));
    }

    /**
     * Admin Device Breakdown.
     */
    @GetMapping("/admin/devices")
    public ResponseEntity<ApiResponse<DeviceReportDTO>> getDevices(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        return ResponseEntity.ok(ApiResponse.ok("Device Report", analyticsService.getDeviceReport(start, end)));
    }

    /**
     * Admin Geographic Breakdown.
     */
    @GetMapping("/admin/geo")
    public ResponseEntity<ApiResponse<GeoReportDTO>> getGeo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        return ResponseEntity.ok(ApiResponse.ok("Geographic Report", analyticsService.getGeoReport(start, end)));
    }

    /**
     * Admin Activity Feed.
     */
    @GetMapping("/admin/activities")
    public ResponseEntity<ApiResponse<Page<ActivityEventDTO>>> getActivities(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        return ResponseEntity.ok(ApiResponse.ok("Recent Activity Log", analyticsService.getRecentActivities(start, end, PageRequest.of(page, size))));
    }

    /**
     * Admin Real-Time Active Visitors.
     */
    @GetMapping("/admin/realtime")
    public ResponseEntity<ApiResponse<List<ActiveVisitorItem>>> getRealtime() {
        return ResponseEntity.ok(ApiResponse.ok("Realtime Active Visitors", analyticsService.getRealtimeVisitors()));
    }

    /**
     * Admin Export CSV Report.
     */
    @GetMapping("/admin/export")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        String csvData = analyticsService.exportCsv(start, end);
        byte[] bytes = csvData.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"medvarn_analytics_" + start.toLocalDate() + "_to_" + end.toLocalDate() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
