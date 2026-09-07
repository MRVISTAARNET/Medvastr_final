package com.medvastr.backend.repository;

import com.medvastr.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.phone LIKE %:phoneSuffix ORDER BY u.id DESC")
    List<User> findAllByPhoneSuffix(@Param("phoneSuffix") String phoneSuffix);

    default Optional<User> findByPhoneSuffix(String phoneSuffix) {
        List<User> list = findAllByPhoneSuffix(phoneSuffix);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    boolean existsByPhone(String phone);

    long countByActiveTrue();

    Page<User> findByActiveTrueOrderByCreatedAtDesc(Pageable p);
}

