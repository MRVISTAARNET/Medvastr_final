package com.medvastr.backend.repository;

import com.medvastr.backend.model.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, Long> {
    Optional<Collection> findBySlug(String slug);
    
    List<Collection> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    List<Collection> findByCollectionTypeAndIsActiveTrueOrderByDisplayOrderAsc(Collection.CollectionType type);
    
    @Query("SELECT c FROM Collection c LEFT JOIN FETCH c.products cp LEFT JOIN FETCH cp.product WHERE c.id = ?1")
    Optional<Collection> findByIdWithProducts(Long id);
}
