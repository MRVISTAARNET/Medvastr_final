package com.medvastr.backend.repository;

import com.medvastr.backend.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdOrderBySizeAsc(Long productId);

    Optional<ProductVariant> findBySku(String sku);

    Optional<ProductVariant> findByIdAndProductId(Long id, Long productId);

    Optional<ProductVariant> findByBarcode(String barcode);

    boolean existsBySkuAndIdNot(String sku, Long id);

    boolean existsByBarcodeAndIdNot(String barcode, Long id);

    Optional<ProductVariant> findByProductIdAndSizeAndColorHex(Long productId, String size, String colorHex);
}
