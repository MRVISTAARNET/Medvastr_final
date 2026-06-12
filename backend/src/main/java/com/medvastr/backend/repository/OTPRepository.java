package com.medvastr.backend.repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.medvastr.backend.model.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    @Query("SELECT o FROM OTP o WHERE o.email = :email AND o.used = false AND o.expiresAt > :now ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OTP> findLatestValidOtp(@Param("email") String email, @Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("DELETE FROM OTP o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("UPDATE OTP o SET o.used = true WHERE o.email = :email AND o.used = false")
    void markAllUsed(@Param("email") String email);
}
