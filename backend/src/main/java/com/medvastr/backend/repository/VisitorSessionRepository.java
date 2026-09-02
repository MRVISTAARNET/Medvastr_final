package com.medvastr.backend.repository;

import com.medvastr.backend.model.VisitorSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitorSessionRepository extends JpaRepository<VisitorSession, Long> {

    Optional<VisitorSession> findBySessionId(String sessionId);

    boolean existsByVisitorId(String visitorId);

    @Query("SELECT COUNT(DISTINCT s.visitorId) FROM VisitorSession s WHERE s.lastActivityTime >= :start AND s.startTime <= :end")
    long countUniqueVisitorsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(s) FROM VisitorSession s WHERE s.lastActivityTime >= :start AND s.startTime <= :end")
    long countSessionsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(s) FROM VisitorSession s WHERE s.lastActivityTime >= :start AND s.startTime <= :end AND s.isNewVisitor = true")
    long countNewVisitorsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(AVG(s.durationSeconds), 0) FROM VisitorSession s WHERE s.lastActivityTime >= :start AND s.startTime <= :end")
    double avgSessionDurationBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s.trafficSource, COUNT(s) FROM VisitorSession s WHERE s.lastActivityTime >= :start AND s.startTime <= :end GROUP BY s.trafficSource ORDER BY COUNT(s) DESC")
    List<Object[]> countByTrafficSourceBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s.deviceType, COUNT(s) FROM VisitorSession s WHERE s.lastActivityTime >= :start AND s.startTime <= :end GROUP BY s.deviceType ORDER BY COUNT(s) DESC")
    List<Object[]> countByDeviceTypeBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s.browser, COUNT(s) FROM VisitorSession s WHERE s.lastActivityTime >= :start AND s.startTime <= :end GROUP BY s.browser ORDER BY COUNT(s) DESC")
    List<Object[]> countByBrowserBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s.os, COUNT(s) FROM VisitorSession s WHERE s.lastActivityTime >= :start AND s.startTime <= :end GROUP BY s.os ORDER BY COUNT(s) DESC")
    List<Object[]> countByOsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(s.country, 'India'), COUNT(s) FROM VisitorSession s WHERE s.lastActivityTime >= :start AND s.startTime <= :end GROUP BY COALESCE(s.country, 'India') ORDER BY COUNT(s) DESC")
    List<Object[]> countByCountryBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(s.city, 'Unknown'), COUNT(s) FROM VisitorSession s WHERE s.lastActivityTime >= :start AND s.startTime <= :end GROUP BY COALESCE(s.city, 'Unknown') ORDER BY COUNT(s) DESC")
    List<Object[]> countByCityBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s FROM VisitorSession s WHERE s.lastActivityTime >= :activeCutoff ORDER BY s.lastActivityTime DESC")
    List<VisitorSession> findActiveSessions(@Param("activeCutoff") LocalDateTime activeCutoff);
}
