package com.medvastr.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "store_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreSetting {
    @Id
    private String settingKey;

    @Column(columnDefinition = "TEXT")
    private String settingValue;
}
