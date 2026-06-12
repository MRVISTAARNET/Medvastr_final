package com.medvastr.backend.repository;

import com.medvastr.backend.model.ProductColor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductColorRepository extends JpaRepository<ProductColor, Long> {
    Optional<ProductColor> findByName(String name);
    
    List<ProductColor> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    @Query("SELECT pc FROM ProductColor pc WHERE pc.isActive = true ORDER BY pc.displayOrder ASC")
    List<ProductColor> findAllActiveColors();
}
