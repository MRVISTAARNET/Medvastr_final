package com.medvastr.repository;

import com.medvastr.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String num);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable p);

    Page<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus s, Pageable p);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable p);

    @Query("SELECT COALESCE(SUM(o.totalAmount),0) FROM Order o WHERE o.paymentStatus='PAID'")
    BigDecimal totalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount),0) FROM Order o WHERE o.paymentStatus='PAID' AND DATE(o.createdAt)=CURRENT_DATE")
    BigDecimal todayRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE DATE(o.createdAt)=CURRENT_DATE")
    Long todayOrders();

    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findRecent(Pageable p);
}

