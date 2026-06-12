package com.medvastr.backend.service;

import com.medvastr.backend.dto.ProductDTO;
import com.medvastr.backend.dto.ProductFilterRequest;
import com.medvastr.backend.dto.ProductRequest;
import com.medvastr.backend.dto.ReviewDTO;
import com.medvastr.backend.dto.ReviewRequest;
import com.medvastr.backend.dto.VariantDTO;
import com.medvastr.backend.model.Product;
import com.medvastr.backend.model.ProductImage;
import com.medvastr.backend.model.ProductVariant;
import com.medvastr.backend.repository.CategoryRepository;
import com.medvastr.backend.repository.ProductRepository;
import com.medvastr.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ProductService {
    private final ProductRepository productRepo;
    private final CategoryRepository catRepo;
    private final ReviewRepository reviewRepo;

    public Page<ProductDTO> getAll(ProductFilterRequest f, Pageable p) {
        return productRepo
                .filter(
                        f.getType(),
                        f.getGender(),
                        f.getFabric(),
                        f.getBadge(),
                        f.getMinPrice() != null ? BigDecimal.valueOf(f.getMinPrice()) : null,
                        f.getMaxPrice() != null ? BigDecimal.valueOf(f.getMaxPrice()) : null,
                        f.getSearch(),
                        p)
                .map(this::toDTO);
    }

    public ProductDTO getById(Long id) {
        return toDTO(productRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found: " + id)));
    }

    public ProductDTO getBySlug(String slug) {
        return toDTO(
                productRepo.findBySlugAndActiveTrue(slug)
                        .orElseThrow(() -> new RuntimeException("Not found: " + slug)));
    }

    public List<ProductDTO> getFeatured() {
        return productRepo.findByFeaturedTrueAndActiveTrueOrderByRatingDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getBestsellers() {
        return productRepo.findByBadgeContainingIgnoreCaseAndActiveTrueOrderByReviewCountDesc("bestseller").stream()
                .limit(8)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getNewArrivals() {
        return productRepo.findByActiveTrueOrderByCreatedAtDesc(PageRequest.of(0, 8)).getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Page<ProductDTO> search(String q, Pageable p) {
        return productRepo.search(q, p).map(this::toDTO);
    }

    public List<String> suggest(String q) {
        return productRepo.suggestNames(q, PageRequest.of(0, 6));
    }

    @Transactional
    public ProductDTO create(ProductRequest r) {
        Product p = Product.builder()
                .name(r.getName())
                .description(r.getDescription())
                .price(r.getPrice())
                .originalPrice(r.getOriginalPrice())
                .fabric(r.getFabric())
                .type(r.getType())
                .gender(r.getGender())
                .badge(r.getBadge())
                .brand(r.getBrand())
                .styleId(r.getStyleId())
                .barcode(r.getBarcode())
                .sku(r.getSku())
                .emoji(r.getEmoji())
                .bgColor(r.getBgColor())
                .fabricDetail(r.getFabricDetail())
                .stretchType(r.getStretchType())
                .pocketCount(r.getPocketCount())
                .careInstructions(r.getCareInstructions())
                .weight(r.getWeight())
                .fit(r.getFit())
                .videoUrl(r.getVideoUrl())
                .shortDescription(r.getShortDescription())
                .material(r.getMaterial())
                .tags(r.getTags())
                .seoTitle(r.getSeoTitle())
                .seoDescription(r.getSeoDescription())
                .slug(slug(r.getName()))
                .build();

        if (r.getCategoryId() != null)
            catRepo.findById(r.getCategoryId()).ifPresent(p::setCategory);

        // Handle Images
        if (r.getImageUrls() != null) {
            p.setImages(r.getImageUrls().stream()
                    .map(url -> ProductImage.builder().imageUrl(url).product(p).build())
                    .collect(Collectors.toList()));
        }

        p.setVariants(buildVariants(r, p));

        return toDTO(productRepo.save(p));
    }

    @Transactional
    public ProductDTO update(Long id, ProductRequest r) {
        Product p = productRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        p.setName(r.getName());
        p.setDescription(r.getDescription());
        p.setPrice(r.getPrice());
        p.setOriginalPrice(r.getOriginalPrice());
        p.setFabric(r.getFabric());
        p.setType(r.getType());
        p.setGender(r.getGender());
        p.setBadge(r.getBadge());
        p.setBrand(r.getBrand());
        p.setStyleId(r.getStyleId());
        p.setSlug(slug(r.getName()));
        p.setBarcode(r.getBarcode());
        p.setSku(r.getSku());
        p.setEmoji(r.getEmoji());
        p.setBgColor(r.getBgColor());
        p.setFabricDetail(r.getFabricDetail());
        p.setStretchType(r.getStretchType());
        p.setPocketCount(r.getPocketCount());
        p.setCareInstructions(r.getCareInstructions());
        p.setWeight(r.getWeight());
        p.setFit(r.getFit());
        p.setVideoUrl(r.getVideoUrl());
        if (r.getShortDescription() != null) p.setShortDescription(r.getShortDescription());
        if (r.getMaterial() != null) p.setMaterial(r.getMaterial());
        if (r.getTags() != null) p.setTags(r.getTags());
        if (r.getSeoTitle() != null) p.setSeoTitle(r.getSeoTitle());
        if (r.getSeoDescription() != null) p.setSeoDescription(r.getSeoDescription());

        if (r.getCategoryId() != null)
            catRepo.findById(r.getCategoryId()).ifPresent(p::setCategory);

        // Update Images (simple replacement)
        if (r.getImageUrls() != null) {
            p.getImages().clear();
            p.getImages().addAll(r.getImageUrls().stream()
                    .map(url -> ProductImage.builder().imageUrl(url).product(p).build())
                    .collect(Collectors.toList()));
        }

        p.getVariants().clear();
        p.getVariants().addAll(buildVariants(r, p));

        return toDTO(productRepo.save(p));
    }

    @Transactional
    public void delete(Long id) {
        productRepo.findById(id).ifPresent(p -> {
            p.setActive(false);
            productRepo.save(p);
        });
    }

    @Transactional
    public ReviewDTO addReview(Long pid, ReviewRequest r, com.medvastr.backend.model.User user) {
        Product p = productRepo.findById(pid).orElseThrow(() -> new RuntimeException("Product not found"));
        com.medvastr.backend.model.Review rev = com.medvastr.backend.model.Review.builder()
                .product(p)
                .user(user)
                .rating(r.getRating())
                .title(r.getTitle())
                .body(r.getBody())
                .approved(false) // Starts as PENDING — admin must approve
                .verified(false)
                .build();

        reviewRepo.save(rev);

        return ReviewDTO.builder()
                .id(rev.getId())
                .productId(p.getId())
                .productName(p.getName())
                .userName(user.getFirstName() + " " + user.getLastName().charAt(0) + ".")
                .rating(rev.getRating())
                .title(rev.getTitle())
                .body(rev.getBody())
                .approved(false)
                .verified(false)
                .createdAt(rev.getCreatedAt())
                .build();
    }

    @Transactional
    public ReviewDTO approveReview(Long reviewId) {
        com.medvastr.backend.model.Review rev = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        rev.setApproved(true);
        rev.setVerified(true);
        reviewRepo.save(rev);
        // Update product rating stats
        double avg = reviewRepo.avgRating(rev.getProduct().getId()).orElse(rev.getRating().doubleValue());
        Product p = rev.getProduct();
        p.setRating(BigDecimal.valueOf(avg));
        p.setReviewCount((int) reviewRepo.countByProductIdAndApprovedTrue(p.getId()));
        productRepo.save(p);
        return toReviewDTO(rev);
    }

    @Transactional
    public void rejectReview(Long reviewId) {
        com.medvastr.backend.model.Review rev = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        reviewRepo.delete(rev);
    }

    public Page<ReviewDTO> getReviews(Long pid, Pageable p) {
        return reviewRepo.findByProductIdAndApprovedTrueOrderByCreatedAtDesc(pid, p)
                .map(r -> ReviewDTO.builder()
                        .id(r.getId())
                        .userName(r.getUser().getFirstName() + " " + r.getUser().getLastName().charAt(0) + ".")
                        .rating(r.getRating())
                        .title(r.getTitle())
                        .body(r.getBody())
                        .verified(r.isVerified())
                        .createdAt(r.getCreatedAt())
                        .build());
    }

    public Page<ReviewDTO> getAllReviews(Pageable p) {
        return reviewRepo.findAllByOrderByCreatedAtDesc(p)
                .map(this::toReviewDTO);
    }

    public Page<ReviewDTO> getPublicReviews(Pageable p) {
        return reviewRepo.findByApprovedTrueOrderByCreatedAtDesc(p)
                .map(this::toReviewDTO);
    }

    private ReviewDTO toReviewDTO(com.medvastr.backend.model.Review r) {
        return ReviewDTO.builder()
                .id(r.getId())
                .productId(r.getProduct() != null ? r.getProduct().getId() : null)
                .productName(r.getProduct() != null ? r.getProduct().getName() : "Unknown")
                .userName(r.getUser().getFirstName() + " " + r.getUser().getLastName().charAt(0) + ".")
                .rating(r.getRating())
                .title(r.getTitle())
                .body(r.getBody())
                .verified(r.isVerified())
                .approved(r.isApproved())
                .createdAt(r.getCreatedAt())
                .build();
    }

    public ProductDTO toDTO(Product p) {
        return ProductDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .shortDescription(p.getShortDescription())
                .material(p.getMaterial())
                .tags(p.getTags())
                .seoTitle(p.getSeoTitle())
                .seoDescription(p.getSeoDescription())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .fabric(p.getFabric())
                .type(p.getType())
                .gender(p.getGender())
                .badge(p.getBadge())
                .brand(p.getBrand())
                .styleId(p.getStyleId())
                .barcode(p.getBarcode())
                .sku(p.getSku())
                .emoji(p.getEmoji())
                .bgColor(p.getBgColor())
                .fabricDetail(p.getFabricDetail())
                .stretchType(p.getStretchType())
                .pocketCount(p.getPocketCount())
                .careInstructions(p.getCareInstructions())
                .weight(p.getWeight())
                .fit(p.getFit())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .active(p.isActive())
                .featured(p.isFeatured())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .variants(
                        p.getVariants().stream()
                                .map(v -> VariantDTO.builder()
                                        .id(v.getId())
                                        .size(v.getSize())
                                        .colorName(v.getColorName())
                                        .colorHex(v.getColorHex())
                                        .stockQuantity(v.getStockQuantity())
                                        .sku(v.getSku())
                                        .imageUrl(v.getImageUrl())
                                        .build())
                                .collect(Collectors.toList()))
                .sizes(
                        p.getVariants().stream()
                                .map(ProductVariant::getSize)
                                .filter(s -> s != null && !s.isBlank())
                                .collect(Collectors.toCollection(LinkedHashSet::new))
                                .stream()
                                .sorted(Comparator.comparingInt(this::sizeOrder))
                                .collect(Collectors.toList()))
                .imageUrls(p.getImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList()))
                .createdAt(p.getCreatedAt())
                .build();
    }

    private List<ProductVariant> buildVariants(ProductRequest r, Product p) {
        if (r.getVariants() != null && !r.getVariants().isEmpty()) {
            return r.getVariants().stream()
                    .map(v -> ProductVariant.builder()
                            .product(p)
                            .size(v.getSize())
                            .colorName(v.getColorName())
                            .colorHex(v.getColorHex())
                            .stockQuantity(v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                            .sku(v.getSku())
                            .imageUrl(v.getImageUrl())
                            .build())
                    .collect(Collectors.toList());
        }

        return new ArrayList<>();
    }

    private String slug(String n) {
        return n.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    private int sizeOrder(String size) {
        String[] order = { "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL" };
        for (int i = 0; i < order.length; i++) {
            if (order[i].equalsIgnoreCase(size))
                return i;
        }
        return 99;
    }
}
