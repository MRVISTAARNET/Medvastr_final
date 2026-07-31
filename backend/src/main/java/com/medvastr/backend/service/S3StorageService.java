package com.medvastr.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.util.Collection;

@Service
@Slf4j
public class S3StorageService {

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

    /**
     * Deletes a single image file from AWS S3 using its URL or S3 key.
     */
    public void deleteFileByUrl(String url) {
        if (url == null || url.isBlank()) return;
        try {
            String key = extractS3Key(url);
            if (key != null && !key.isBlank()) {
                try (S3Client s3 = buildS3Client()) {
                    s3.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(key).build());
                }
                log.info("[S3] Successfully purged S3 object key: {}", key);
            }
        } catch (Exception e) {
            log.warn("[S3] Could not delete S3 object for URL {}: {}", url, e.getMessage());
        }
    }

    /**
     * Deletes multiple image files from AWS S3.
     */
    public void deleteFilesByUrls(Collection<String> urls) {
        if (urls == null || urls.isEmpty()) return;
        for (String url : urls) {
            deleteFileByUrl(url);
        }
    }

    private String extractS3Key(String url) {
        if (url.contains(".amazonaws.com/")) {
            return url.substring(url.indexOf(".amazonaws.com/") + 15);
        } else if (url.contains("cloudfront.net/")) {
            return url.substring(url.indexOf("cloudfront.net/") + 15);
        } else if (url.startsWith("media/")) {
            return url;
        }
        return null;
    }
}
