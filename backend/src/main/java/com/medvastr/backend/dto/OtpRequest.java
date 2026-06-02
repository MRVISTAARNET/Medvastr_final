package com.medvastr.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpRequest {
    @Email
    @NotBlank
    private String email;
    private String otp;
}
