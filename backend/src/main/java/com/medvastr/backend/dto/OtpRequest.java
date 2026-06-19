package com.medvastr.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpRequest {
    @Email
    @NotBlank
    private String email;

    @JsonAlias({ "otpCode", "code" }) // frontend sends "otpCode" or "code", backend stores as "otp"
    private String otp;
}
