package com.medvastr.backend.repository;

import com.medvastr.backend.model.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductSizeRepository extends JpaRepository<ProductSize, Long> {
    Optional<ProductSize> findBySizeValue(String sizeValue);
    
    List<ProductSize> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    @Query("SELECT ps FROM ProductSize ps WHERE ps.isActive = true ORDER BY ps.displayOrder ASC")
    List<ProductSize> findAllActiveSizes();
}
