package com.medvastr.backend.repository;

import com.medvastr.backend.model.Product;
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
public interface ProductRepository extends JpaRepository<Product, Long> {
        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "images" })
        Optional<Product> findBySlugAndActiveTrue(String slug);

        Optional<Product> findBySku(String sku);

        List<Product> findByFeaturedTrueAndActiveTrueOrderByRatingDesc();

        List<Product> findByBadgeContainingIgnoreCaseAndActiveTrueOrderByReviewCountDesc(String badge);

        Page<Product> findByActiveTrueOrderByCreatedAtDesc(Pageable p);

        long countByActiveTrue();

        @Query("SELECT p FROM Product p WHERE p.active=true " +
                        "AND (:type IS NULL OR p.type=:type) " +
                        "AND (:gender IS NULL OR p.gender=:gender OR p.gender='unisex') " +
                        "AND (:fabric IS NULL OR p.fabric=:fabric) " +
                        "AND (:badge IS NULL OR p.badge=:badge) " +
                        "AND (:minP IS NULL OR p.price>=:minP) " +
                        "AND (:maxP IS NULL OR p.price<=:maxP) " +
                        "AND (:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%',:q,'%'))) " +
                        "AND (:categoryIds IS NULL OR p.category.id IN :categoryIds OR p.subcategory.id IN :categoryIds OR p.childCategory.id IN :categoryIds)")
        Page<Product> filter(
                        @Param("type") String type,
                        @Param("gender") String gender,
                        @Param("fabric") String fabric,
                        @Param("badge") String badge,
                        @Param("minP") BigDecimal minP,
                        @Param("maxP") BigDecimal maxP,
                        @Param("q") String q,
                        @Param("categoryIds") List<Long> categoryIds,
                        Pageable p);

        @Query("SELECT DISTINCT p FROM Product p " +
                        "LEFT JOIN p.variants v " +
                        "LEFT JOIN p.category c " +
                        "LEFT JOIN p.subcategory sc " +
                        "WHERE p.active=true AND (" +
                        "LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(p.description) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(p.sku) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(v.sku) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(v.colorName) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(c.name) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(sc.name) LIKE LOWER(CONCAT('%',:q,'%'))" +
                        ")")
        Page<Product> search(@Param("q") String q, Pageable p);

        @Query("SELECT DISTINCT p FROM Product p " +
                        "LEFT JOIN p.variants v " +
                        "LEFT JOIN p.category c " +
                        "LEFT JOIN p.subcategory sc " +
                        "WHERE p.active=true " +
                        "AND (p.gender IS NULL OR LOWER(p.gender) NOT IN :excludedGenders) " +
                        "AND (" +
                        "LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(p.description) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(p.sku) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(v.sku) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(v.colorName) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(c.name) LIKE LOWER(CONCAT('%',:q,'%')) " +
                        "OR LOWER(sc.name) LIKE LOWER(CONCAT('%',:q,'%'))" +
                        ")")
        Page<Product> searchForGender(@Param("q") String q, @Param("excludedGenders") List<String> excludedGenders, Pageable p);

        @Query("SELECT p FROM Product p WHERE p.active=true AND LOWER(p.gender) IN :genders")
        Page<Product> findByGenderIn(@Param("genders") List<String> genders, Pageable p);


        @Query("SELECT p.name FROM Product p WHERE p.active=true AND LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%'))")
        List<String> suggestNames(@Param("q") String q, Pageable p);
}
