package com.medvastr.backend.repository;

import com.medvastr.backend.model.BulkOrderConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BulkOrderConfigRepository extends JpaRepository<BulkOrderConfig, Long> {
    List<BulkOrderConfig> findByIsActiveTrueOrderByMinQuantityAsc();
    
    @Query("SELECT b FROM BulkOrderConfig b WHERE b.isActive = true ORDER BY b.minQuantity ASC")
    List<BulkOrderConfig> findAllActiveTiers();
    
    @Query("SELECT b FROM BulkOrderConfig b WHERE b.isActive = true AND ?1 >= b.minQuantity AND (?2 IS NULL OR ?1 <= b.maxQuantity) ORDER BY b.minQuantity DESC LIMIT 1")
    BulkOrderConfig findApplicableTier(Integer quantity, Integer maxQuantity);
}
