package com.medvastr.backend.repository;

import com.medvastr.backend.model.InventoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {
    List<InventoryLog> findByVariantIdOrderByCreatedAtDesc(Long variantId);
}
