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
}

