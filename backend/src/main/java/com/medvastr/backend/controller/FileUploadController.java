package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@Slf4j
@CrossOrigin(origins = "*")
public class FileUploadController {

    // On Elastic Beanstalk, we'll store in a local directory
    private final String UPLOAD_DIR = "uploads/";

    public FileUploadController() {
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            boolean created = directory.mkdir();
            log.info("Upload directory created: {}", created);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.err("Please select a file to upload."));
        }

        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            // Save file
            Path path = Paths.get(UPLOAD_DIR + newFilename);
            Files.write(path, file.getBytes());

            // Generate URL to return
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/media/")
                    .path(newFilename)
                    .toUriString();

            log.info("File uploaded successfully: {}", fileDownloadUri);
            return ResponseEntity.ok(ApiResponse.ok("Uploaded successfully", fileDownloadUri));

        } catch (IOException e) {
            log.error("Failed to upload file", e);
            return ResponseEntity.internalServerError().body(ApiResponse.err("Failed to upload file"));
        }
    }
}
