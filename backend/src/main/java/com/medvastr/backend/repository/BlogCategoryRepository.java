package com.medvastr.backend.repository;

import com.medvastr.backend.model.BlogCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlogCategoryRepository extends JpaRepository<BlogCategory, Long> {
    List<BlogCategory> findByActiveTrueOrderByDisplayOrderAsc();
    Optional<BlogCategory> findBySlugAndActiveTrue(String slug);
}
