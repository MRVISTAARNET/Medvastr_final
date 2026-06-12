package com.medvastr.backend.repository;

import com.medvastr.backend.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    List<Banner> findByPositionAndIsActiveTrueOrderByDisplayOrderAsc(Banner.BannerPosition position);

}
