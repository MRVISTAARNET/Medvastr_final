package com.medvastr.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    @Size(max = 80)
    private String firstName;

    @Size(max = 80)
    private String lastName;

    @Size(max = 15)
    private String phone;

    private String email;
}

