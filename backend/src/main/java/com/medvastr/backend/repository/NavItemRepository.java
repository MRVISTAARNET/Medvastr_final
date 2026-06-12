package com.medvastr.backend.repository;

import com.medvastr.backend.model.NavItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NavItemRepository extends JpaRepository<NavItem, Long> {
    List<NavItem> findByParentIsNullAndActiveTrueOrderByDisplayOrderAsc();
    List<NavItem> findByActiveTrueOrderByDisplayOrderAsc();
}
