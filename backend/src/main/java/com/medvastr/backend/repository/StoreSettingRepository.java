package com.medvastr.backend.repository;

import com.medvastr.backend.model.StoreSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreSettingRepository extends JpaRepository<StoreSetting, String> {
}
