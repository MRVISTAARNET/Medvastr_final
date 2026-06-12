package com.medvastr.backend.repository;

import com.medvastr.backend.model.ProductAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductAttributeRepository extends JpaRepository<ProductAttribute, Long> {
    List<ProductAttribute> findByActiveTrueOrderByDisplayOrderAsc();
    List<ProductAttribute> findByFilterableTrueAndActiveTrueOrderByDisplayOrderAsc();
    Optional<ProductAttribute> findBySlug(String slug);
}
