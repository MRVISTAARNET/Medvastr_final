package com.medvastr.backend.repository;

import com.medvastr.backend.model.Settings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingsRepo extends JpaRepository<Settings, String> {
}
