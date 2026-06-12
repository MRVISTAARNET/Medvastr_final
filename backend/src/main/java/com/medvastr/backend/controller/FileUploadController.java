package com.medvastr.backend.controller;

import com.medvastr.backend.dto.ApiResponse;
import com.medvastr.backend.util.FileUploadValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@Slf4j
public class FileUploadController {

    @Value("${aws.s3.bucket-name:medvastr-assets}")
    private String bucketName;

    @Value("${aws.s3.region:ap-south-1}")
    private String region;

    @Value("${aws.accessKeyId:}")
    private String accessKeyId;

    @Value("${aws.secretKey:}")
    private String secretKey;

    private S3Client buildS3Client() {
        if (accessKeyId != null && !accessKeyId.isBlank()) {
            AwsBasicCredentials creds = AwsBasicCredentials.create(accessKeyId, secretKey);
            return S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(creds))
                    .build();
        }
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            FileUploadValidator.validate(file);
            String extension = FileUploadValidator.sanitizedExtension(file.getOriginalFilename());

            if (accessKeyId == null || accessKeyId.isBlank()) {
                log.warn("AWS Credentials not found. Falling back to local storage.");
                return saveLocally(file, extension);
            }

            String s3Key = "media/" + UUID.randomUUID() + extension;

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .build();

            try (S3Client s3 = buildS3Client()) {
                s3.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));
            }

            String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, s3Key);
            log.info("File uploaded to S3: {}", fileUrl);
            return ResponseEntity.ok(ApiResponse.ok("Uploaded successfully", fileUrl));

        } catch (Exception e) {
            log.error("Upload failed", e);
            return ResponseEntity.badRequest().body(ApiResponse.err(e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @org.springframework.web.bind.annotation.RequestBody Map<String, String> body) {
        String url = body.get("url");
        if (url == null || url.isBlank())
            return ResponseEntity.badRequest().build();

        try {
            if (url.contains(".amazonaws.com/")) {
                String key = url.substring(url.indexOf(".amazonaws.com/") + 15);
                try (S3Client s3 = buildS3Client()) {
                    s3.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build());
                }
                log.info("Deleted from S3: {}", key);
            } else if (url.startsWith("/api/media/")) {
                String filename = url.replace("/api/media/", "");
                Files.deleteIfExists(Paths.get("uploads").resolve(filename));
                log.info("Deleted locally: {}", filename);
            }
            return ResponseEntity.ok(ApiResponse.ok("Deleted successfully", null));
        } catch (Exception e) {
            log.error("Delete failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.err("Delete failed"));
        }
    }

    private ResponseEntity<ApiResponse<String>> saveLocally(MultipartFile file, String extension) throws Exception {
        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        String fileName = UUID.randomUUID() + extension;
        Path targetLocation = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/api/media/" + fileName;
        log.info("File uploaded locally: path={}", targetLocation);
        return ResponseEntity.ok(ApiResponse.ok("Uploaded successfully", fileUrl));
    }
}
