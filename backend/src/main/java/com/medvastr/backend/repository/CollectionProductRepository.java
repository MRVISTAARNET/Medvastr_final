package com.medvastr.backend.repository;

import com.medvastr.backend.model.CollectionProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionProductRepository extends JpaRepository<CollectionProduct, Long> {
    List<CollectionProduct> findByCollectionIdOrderByDisplayOrderAsc(Long collectionId);
    
    Optional<CollectionProduct> findByCollectionIdAndProductId(Long collectionId, Long productId);
    
    @Modifying
    @Query("DELETE FROM CollectionProduct cp WHERE cp.collection.id = ?1 AND cp.product.id = ?2")
    void deleteByCollectionAndProduct(Long collectionId, Long productId);
    
    long countByCollectionId(Long collectionId);
}
