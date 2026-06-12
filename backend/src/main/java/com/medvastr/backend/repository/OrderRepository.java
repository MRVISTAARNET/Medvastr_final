package com.medvastr.backend.repository;

import com.medvastr.backend.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String num);

    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable p);

    Page<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus s, Pageable p);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable p);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = :paid")
    BigDecimal totalRevenue(@Param("paid") Order.PaymentStatus paid);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = :paid AND CAST(o.createdAt AS localdate) = CURRENT_DATE")
    BigDecimal todayRevenue(@Param("paid") Order.PaymentStatus paid);

    @Query("SELECT COUNT(o) FROM Order o WHERE CAST(o.createdAt AS localdate) = CURRENT_DATE")
    Long todayOrders();

    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findRecent(Pageable p);
}

