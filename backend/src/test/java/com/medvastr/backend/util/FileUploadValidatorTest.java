package com.medvastr.backend.util;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FileUploadValidatorTest {

    @Test
    void acceptsValidPng() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.png", "image/png", new byte[]{ (byte) 0x89, 0x50, 0x4E, 0x47 });
        assertDoesNotThrow(() -> FileUploadValidator.validate(file));
    }

    @Test
    void rejectsExecutableExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "malware.exe", "image/png", new byte[]{1, 2, 3});
        assertThrows(IllegalArgumentException.class, () -> FileUploadValidator.validate(file));
    }

    @Test
    void rejectsOversizedFile() {
        byte[] large = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file", "big.jpg", "image/jpeg", large);
        assertThrows(IllegalArgumentException.class, () -> FileUploadValidator.validate(file));
    }

    @Test
    void rejectsPathTraversalFilename() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "../etc/passwd.png", "image/png", new byte[]{1, 2, 3});
        assertThrows(IllegalArgumentException.class, () -> FileUploadValidator.validate(file));
    }
}
