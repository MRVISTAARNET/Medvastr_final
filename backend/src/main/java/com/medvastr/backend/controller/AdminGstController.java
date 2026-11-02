package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.dto.GstReportDTO;
import com.medvastr.backend.service.GstReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping({ "/api/admin/gst-report", "/admin/gst-report" })
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminGstController {
    private final GstReportService gstReportService;

    /** GET /api/admin/gst-report?from=2026-10-01&to=2026-10-31 */
    @GetMapping
    public ResponseEntity<ApiResponse<GstReportDTO>> report(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok("GST report", gstReportService.build(from, to)));
    }
}
