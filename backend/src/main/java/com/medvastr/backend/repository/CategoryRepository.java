package com.medvastr.backend.repository;

import com.medvastr.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlugAndActiveTrue(String slug);

    List<Category> findByActiveTrueOrderByDisplayOrderAsc();
}

