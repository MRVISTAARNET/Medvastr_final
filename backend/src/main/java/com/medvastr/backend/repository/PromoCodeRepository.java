package com.medvastr.backend.repository;

import com.medvastr.backend.model.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {
    List<PromoCode> findAllByCodeIgnoreCaseAndActiveTrue(String code);

    default Optional<PromoCode> findByCodeIgnoreCaseAndActiveTrue(String code) {
        List<PromoCode> list = findAllByCodeIgnoreCaseAndActiveTrue(code);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    boolean existsByCodeIgnoreCase(String code);

    List<PromoCode> findAllByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE PromoCode p SET p.usedCount = COALESCE(p.usedCount, 0) + 1 WHERE p.id = :id")
    void incrementUsage(@org.springframework.data.repository.query.Param("id") Long id);
}

