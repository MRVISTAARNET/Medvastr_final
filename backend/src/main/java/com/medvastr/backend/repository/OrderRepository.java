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

    @Query("SELECT o FROM Order o WHERE o.orderNumber = :num OR o.trackingNumber = :num OR CAST(o.shiprocketOrderId AS string) = :num OR o.razorpayOrderId = :num")
    Optional<Order> findAnyMatchingOrder(@Param("num") String num);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable p);

    @Query("SELECT DISTINCT o FROM Order o WHERE (o.user IS NOT NULL AND o.user.id = :userId) " +
           "OR (:email IS NOT NULL AND o.user IS NOT NULL AND LOWER(o.user.email) = LOWER(:email)) " +
           "OR (:cleanPhone IS NOT NULL AND (o.shippingPhone = :phone OR o.shippingPhone = :cleanPhone OR o.shippingPhone LIKE CONCAT('%', :cleanPhone))) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findUserOrdersSmart(@Param("userId") Long userId,
                                   @Param("email") String email,
                                   @Param("phone") String phone,
                                   @Param("cleanPhone") String cleanPhone,
                                   Pageable p);

    @Query("SELECT o FROM Order o WHERE (o.shippingPhone = :suffix OR o.shippingPhone LIKE CONCAT('%', :suffix)) AND o.user IS NOT NULL ORDER BY o.createdAt DESC")
    List<Order> findRecentWithUserByPhoneSuffix(@Param("suffix") String suffix);

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

