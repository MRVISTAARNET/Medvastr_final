package com.medvastr.backend.repository;

import com.medvastr.backend.model.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {
    List<ProductAttributeValue> findByAttributeIdAndActiveTrueOrderByDisplayOrderAsc(Long attributeId);
}
