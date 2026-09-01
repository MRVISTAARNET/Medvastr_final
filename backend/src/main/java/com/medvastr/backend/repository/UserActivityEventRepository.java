package com.medvastr.backend.repository;

import com.medvastr.backend.model.UserActivityEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityEventRepository extends JpaRepository<UserActivityEvent, Long> {

    @Query("SELECT e FROM UserActivityEvent e WHERE e.createdAt >= :start AND e.createdAt <= :end ORDER BY e.createdAt DESC")
    Page<UserActivityEvent> findRecentEventsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    @Query("SELECT e.eventType, COUNT(e) FROM UserActivityEvent e WHERE e.createdAt >= :start AND e.createdAt <= :end GROUP BY e.eventType ORDER BY COUNT(e) DESC")
    List<Object[]> countByEventTypeBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
