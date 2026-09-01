package com.medvastr.backend.repository;

import com.medvastr.backend.model.PageView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PageViewRepository extends JpaRepository<PageView, Long> {

    @Query("SELECT COUNT(pv) FROM PageView pv WHERE pv.viewTime >= :start AND pv.viewTime <= :end")
    long countPageViewsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT pv.pageUrl, pv.pageTitle, COUNT(pv), COUNT(DISTINCT pv.session.visitorId), COALESCE(AVG(pv.durationSeconds), 0), SUM(CASE WHEN pv.entry = true THEN 1 ELSE 0 END), SUM(CASE WHEN pv.exit = true THEN 1 ELSE 0 END) " +
           "FROM PageView pv WHERE pv.viewTime >= :start AND pv.viewTime <= :end GROUP BY pv.pageUrl, pv.pageTitle ORDER BY COUNT(pv) DESC")
    List<Object[]> findTopPagesBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
