package com.medvastr.backend.repository;

import com.medvastr.backend.model.OrderFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderFeedbackRepository extends JpaRepository<OrderFeedback, Long> {
    Optional<OrderFeedback> findByOrderNumber(String orderNumber);
}
