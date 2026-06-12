package com.medvastr.backend.repository;

import com.medvastr.backend.model.Cart;
import com.medvastr.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User u);
    Optional<Cart> findByUserId(Long userId);
}

