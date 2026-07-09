package com.medvastr.backend.service;

import com.medvastr.backend.dto.ProductDTO;
import com.medvastr.backend.dto.ProductFilterRequest;
import com.medvastr.backend.dto.ProductImageDTO;
import com.medvastr.backend.dto.ProductRequest;
import com.medvastr.backend.dto.ReviewDTO;
import com.medvastr.backend.dto.ReviewRequest;
import com.medvastr.backend.dto.VariantDTO;
import com.medvastr.backend.model.Category;
import com.medvastr.backend.model.Product;
import com.medvastr.backend.model.ProductImage;
import com.medvastr.backend.model.ProductVariant;
import com.medvastr.backend.repository.CategoryRepository;
import com.medvastr.backend.repository.ProductColorRepository;
import com.medvastr.backend.repository.ProductRepository;
import com.medvastr.backend.repository.ProductSizeRepository;
import com.medvastr.backend.repository.ProductVariantRepository;
import com.medvastr.backend.repository.ReviewRepository;
import com.medvastr.backend.model.InventoryLog;
import com.medvastr.backend.repository.InventoryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ProductService {
    private final ProductRepository productRepo;
    private final CategoryRepository catRepo;
    private final CategoryService categoryService;
    private final ReviewRepository reviewRepo;
    private final ProductColorRepository colorRepo;
    private final ProductSizeRepository sizeRepo;
    private final ProductVariantRepository variantRepo;
    private final InventoryLogRepository inventoryLogRepo;

    public Page<ProductDTO> getAll(ProductFilterRequest f, Pageable p) {
        List<Long> categoryIds = null;
        if (f.getCategoryId() != null) {
            categoryIds = categoryService.getCategoryAndDescendantIds(f.getCategoryId());
        } else if (f.getCategorySlug() != null && !f.getCategorySlug().isBlank()) {
            try {
                categoryIds = categoryService.getCategoryAndDescendantIdsBySlug(f.getCategorySlug());
            } catch (RuntimeException ex) {
                categoryIds = List.of(-1L);
            }
        }

        return productRepo
                .filter(
                        f.getType(),
                        f.getGender(),
                        f.getFabric(),
                        f.getBadge(),
                        f.getMinPrice() != null ? BigDecimal.valueOf(f.getMinPrice()) : null,
                        f.getMaxPrice() != null ? BigDecimal.valueOf(f.getMaxPrice()) : null,
                        f.getSearch(),
                        categoryIds,
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
        String query = q.trim().toLowerCase();
        
        // Check if search is exactly "men", "man", "mens", "mans"
        if (query.equals("men") || query.equals("man") || query.equals("mens") || query.equals("mans")) {
            return productRepo.findByGenderIn(List.of("men", "unisex"), p).map(this::toDTO);
        }
        
        // Check if search is exactly "women", "woman", "womens", "womans"
        if (query.equals("women") || query.equals("woman") || query.equals("womens") || query.equals("womans")) {
            return productRepo.findByGenderIn(List.of("women", "unisex"), p).map(this::toDTO);
        }

        String cleanQuery = q;
        List<String> excludedGenders = null;
        
        boolean isMenSearch = query.contains(" men ") || query.contains(" mens ") || query.contains(" man ") || query.contains(" mans ")
                || query.startsWith("men ") || query.startsWith("mens ") || query.startsWith("man ") || query.startsWith("mans ")
                || query.endsWith(" men") || query.endsWith(" mens") || query.endsWith(" man") || query.endsWith(" mans");
                
        boolean isWomenSearch = query.contains(" women ") || query.contains(" womens ") || query.contains(" woman ") || query.contains(" womans ")
                || query.startsWith("women ") || query.startsWith("womens ") || query.startsWith("woman ") || query.startsWith("womans ")
                || query.endsWith(" women") || query.endsWith(" womens") || query.endsWith(" woman") || query.endsWith(" womans");

        if (isMenSearch && !isWomenSearch) {
            excludedGenders = List.of("women");
            cleanQuery = query.replaceAll("(?i)\\b(men|man|mens|mans|for)\\b", "").trim();
            if (cleanQuery.isEmpty()) {
                cleanQuery = q;
            }
        } else if (isWomenSearch && !isMenSearch) {
            excludedGenders = List.of("men");
            cleanQuery = query.replaceAll("(?i)\\b(women|woman|womens|womans|for)\\b", "").trim();
            if (cleanQuery.isEmpty()) {
                cleanQuery = q;
            }
        }

        if (excludedGenders != null) {
            return productRepo.searchForGender(cleanQuery, excludedGenders, p).map(this::toDTO);
        }

        return productRepo.search(q, p).map(this::toDTO);
    }

    public List<String> suggest(String q) {
        return productRepo.suggestNames(q, PageRequest.of(0, 6));
    }

    @Transactional
    public ProductDTO create(ProductRequest r) {
        if (r.getSku() != null && !r.getSku().isBlank()) {
            productRepo.findBySku(r.getSku()).ifPresent(existing -> {
                throw new RuntimeException("Duplicate product SKU: " + r.getSku());
            });
        }

        String finalType = r.getType();
        if (finalType == null || finalType.isBlank()) {
            finalType = deduceTypeFromCategoryId(r.getCategoryId(), r.getSubcategoryId());
        }

        String seoTitle = r.getSeoTitle();
        if (seoTitle == null || seoTitle.isBlank()) {
            seoTitle = r.getName() + " | Buy Premium Medical Wear - Medvastr";
        }
        String seoDescription = r.getSeoDescription();
        if (seoDescription == null || seoDescription.isBlank()) {
            seoDescription = r.getShortDescription() != null ? r.getShortDescription() : 
                (r.getDescription() != null ? r.getDescription().substring(0, Math.min(r.getDescription().length(), 150)) : "");
        }
        String seoKeywords = r.getSeoKeywords();
        if (seoKeywords == null || seoKeywords.isBlank()) {
            seoKeywords = r.getName().toLowerCase() + ", medvastr, medical scrubs, " + (r.getGender() != null ? r.getGender().toLowerCase() : "unisex") + " scrubs";
        }

        Product p = Product.builder()
                .name(r.getName())
                .description(r.getDescription())
                .price(r.getPrice())
                .originalPrice(r.getOriginalPrice())
                .fabric(r.getFabric())
                .type(finalType)
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
                .categoryIds(r.getCategoryIds())
                .shortDescription(r.getShortDescription())
                .material(r.getMaterial())
                .tags(r.getTags())
                .seoTitle(seoTitle)
                .seoDescription(seoDescription)
                .seoKeywords(seoKeywords)
                .tax(r.getTax() != null ? r.getTax() : BigDecimal.ZERO)
                .codDisabled(r.getCodDisabled() != null ? r.getCodDisabled() : false)
                .slug(generateUniqueSlug(r.getName()))
                .build();

        if (r.getCategoryId() != null)
            catRepo.findById(r.getCategoryId()).ifPresent(p::setCategory);
        assignSubAndChildCategories(p, r);

        p.setVariants(buildVariants(r, p));
        replaceImages(p, r.getImageUrls());

        Product saved = productRepo.save(p);

        if (saved.getVariants() != null) {
            for (ProductVariant v : saved.getVariants()) {
                InventoryLog logEntry = InventoryLog.builder()
                        .variant(v)
                        .changeQuantity(v.getStockQuantity())
                        .previousStock(0)
                        .newStock(v.getStockQuantity())
                        .actionType("INITIAL_CREATION")
                        .notes("Initial product variant creation")
                        .build();
                inventoryLogRepo.save(logEntry);
            }
        }

        return toDTO(saved);
    }

    @Transactional
    public ProductDTO update(Long id, ProductRequest r) {
        Product p = productRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        
        if (r.getSku() != null && !r.getSku().isBlank()) {
            productRepo.findBySku(r.getSku()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new RuntimeException("Duplicate product SKU: " + r.getSku());
                }
            });
        }

        p.setName(r.getName());
        p.setDescription(r.getDescription());
        p.setPrice(r.getPrice());
        p.setOriginalPrice(r.getOriginalPrice());
        p.setFabric(r.getFabric());

        String finalType = r.getType();
        if (finalType == null || finalType.isBlank()) {
            finalType = deduceTypeFromCategoryId(r.getCategoryId(), r.getSubcategoryId());
        }
        p.setType(finalType);
        p.setGender(r.getGender());
        p.setBadge(r.getBadge());
        p.setBrand(r.getBrand());
        p.setStyleId(r.getStyleId());

        if (!p.getName().equalsIgnoreCase(r.getName())) {
            p.setSlug(generateUniqueSlug(r.getName()));
        }
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
        p.setCategoryIds(r.getCategoryIds());
        if (r.getShortDescription() != null)
            p.setShortDescription(r.getShortDescription());
        if (r.getMaterial() != null)
            p.setMaterial(r.getMaterial());
        if (r.getTags() != null)
            p.setTags(r.getTags());

        String seoTitle = r.getSeoTitle();
        if (seoTitle == null || seoTitle.isBlank()) {
            seoTitle = r.getName() + " | Buy Premium Medical Wear - Medvastr";
        }
        String seoDescription = r.getSeoDescription();
        if (seoDescription == null || seoDescription.isBlank()) {
            seoDescription = r.getShortDescription() != null ? r.getShortDescription() : 
                (r.getDescription() != null ? r.getDescription().substring(0, Math.min(r.getDescription().length(), 150)) : "");
        }
        String seoKeywords = r.getSeoKeywords();
        if (seoKeywords == null || seoKeywords.isBlank()) {
            seoKeywords = r.getName().toLowerCase() + ", medvastr, medical scrubs, " + (r.getGender() != null ? r.getGender().toLowerCase() : "unisex") + " scrubs";
        }
        p.setSeoTitle(seoTitle);
        p.setSeoDescription(seoDescription);
        p.setSeoKeywords(seoKeywords);
        p.setTax(r.getTax() != null ? r.getTax() : BigDecimal.ZERO);
        p.setCodDisabled(r.getCodDisabled() != null ? r.getCodDisabled() : false);

        if (r.getCategoryId() != null)
            catRepo.findById(r.getCategoryId()).ifPresent(p::setCategory);
        assignSubAndChildCategories(p, r);

        if (r.getImageUrls() != null) {
            p.getImages().clear();
            productRepo.saveAndFlush(p); // Force clear old images
            replaceImages(p, r.getImageUrls());
        }

        // Parse requested variants
        Set<ProductVariant> requestedVariants = buildVariants(r, p);

        // Keep track of existing variants by a unique key: size + colorName
        java.util.Map<String, ProductVariant> existingMap = new java.util.HashMap<>();
        for (ProductVariant v : p.getVariants()) {
            if (v.getSize() != null) {
                String key = v.getSize().trim().toUpperCase() + "_" + (v.getColorName() != null ? v.getColorName().trim().toLowerCase() : "");
                existingMap.put(key, v);
            }
        }

        // We will build the new set of variants
        Set<ProductVariant> mergedVariants = new LinkedHashSet<>();
        
        for (ProductVariant req : requestedVariants) {
            String key = req.getSize().trim().toUpperCase() + "_" + (req.getColorName() != null ? req.getColorName().trim().toLowerCase() : "");
            if (existingMap.containsKey(key)) {
                // Update existing variant in place
                ProductVariant ext = existingMap.get(key);
                
                int prevStock = ext.getStockQuantity();
                ext.setStockQuantity(req.getStockQuantity());
                ext.setVariantPrice(req.getVariantPrice());
                ext.setVariantOriginalPrice(req.getVariantOriginalPrice());
                ext.setImageUrl(req.getImageUrl());
                ext.setActive(req.getActive());
                ext.setSku(req.getSku());
                ext.setBarcode(req.getBarcode());
                
                // Write inventory log if stock changed
                if (prevStock != ext.getStockQuantity()) {
                    InventoryLog logEntry = InventoryLog.builder()
                            .variant(ext)
                            .changeQuantity(ext.getStockQuantity() - prevStock)
                            .previousStock(prevStock)
                            .newStock(ext.getStockQuantity())
                            .actionType("ADMIN_UPDATE")
                            .notes("Product variant update")
                            .build();
                    inventoryLogRepo.save(logEntry);
                }
                mergedVariants.add(ext);
            } else {
                // Save new variant first to generate ID
                ProductVariant savedVariant = variantRepo.save(req);
                mergedVariants.add(savedVariant);
                
                InventoryLog logEntry = InventoryLog.builder()
                        .variant(savedVariant)
                        .changeQuantity(savedVariant.getStockQuantity())
                        .previousStock(0)
                        .newStock(savedVariant.getStockQuantity())
                        .actionType("INITIAL_CREATION")
                        .notes("Initial product variant creation")
                        .build();
                inventoryLogRepo.save(logEntry);
            }
        }

        // For any existing variants that were NOT requested, we deactivate them instead of deleting them!
        // This completely avoids Foreign Key violations!
        for (ProductVariant ext : p.getVariants()) {
            if (ext.getSize() != null) {
                String key = ext.getSize().trim().toUpperCase() + "_" + (ext.getColorName() != null ? ext.getColorName().trim().toLowerCase() : "");
                boolean stillRequested = requestedVariants.stream().anyMatch(req -> {
                    String reqKey = req.getSize().trim().toUpperCase() + "_" + (req.getColorName() != null ? req.getColorName().trim().toLowerCase() : "");
                    return reqKey.equals(key);
                });
                if (!stillRequested) {
                    ext.setActive(false);
                    mergedVariants.add(ext);
                }
            }
        }

        p.getVariants().clear();
        p.getVariants().addAll(mergedVariants);

        Product saved = productRepo.save(p);

        return toDTO(saved);
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
                .approved(true) // Auto-approved so it shows up immediately
                .verified(true)
                .build();

        reviewRepo.save(rev);

        // Update product rating stats immediately
        double avg = reviewRepo.avgRating(p.getId()).orElse(rev.getRating().doubleValue());
        p.setRating(java.math.BigDecimal.valueOf(avg));
        p.setReviewCount((int) reviewRepo.countByProductIdAndApprovedTrue(p.getId()));
        productRepo.save(p);

        String lastInitial = (user.getLastName() != null && !user.getLastName().isEmpty()) 
                ? " " + user.getLastName().charAt(0) + "." 
                : "";

        return ReviewDTO.builder()
                .id(rev.getId())
                .productId(p.getId())
                .productName(p.getName())
                .userName(user.getFirstName() + lastInitial)
                .rating(rev.getRating())
                .title(rev.getTitle())
                .body(rev.getBody())
                .approved(true)
                .verified(true)
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
                .seoKeywords(p.getSeoKeywords())
                .tax(p.getTax())
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
                .categoryIds(p.getCategoryIds())
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
                .codDisabled(p.isCodDisabled())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .subcategoryId(p.getSubcategory() != null ? p.getSubcategory().getId() : null)
                .subcategoryName(p.getSubcategory() != null ? p.getSubcategory().getName() : null)
                .childCategoryId(p.getChildCategory() != null ? p.getChildCategory().getId() : null)
                .childCategoryName(p.getChildCategory() != null ? p.getChildCategory().getName() : null)
                .variants(
                        p.getVariants().stream()
                                .map(v -> VariantDTO.builder()
                                        .id(v.getId())
                                        .size(v.getSize())
                                        .colorName(v.getColorName())
                                        .colorHex(v.getColorHex())
                                        .stockQuantity(v.getStockQuantity())
                                        .sku(v.getSku())
                                        .barcode(v.getBarcode())
                                        .variantPrice(v.getVariantPrice())
                                        .variantOriginalPrice(v.getVariantOriginalPrice())
                                        .imageUrl(v.getImageUrl())
                                        .active(v.getActive())
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
                .imageUrls(p.getImages().stream()
                        .sorted(Comparator.comparingInt(ProductImage::getDisplayOrder))
                        .map(ProductImage::getImageUrl).collect(Collectors.toList()))
                .images(p.getImages().stream()
                        .sorted(Comparator.comparingInt(ProductImage::getDisplayOrder))
                        .map(img -> ProductImageDTO.builder()
                                .id(img.getId())
                                .imageUrl(img.getImageUrl())
                                .colorCode(img.getColorCode())
                                .colorHex(img.getColorCode())
                                .displayOrder(img.getDisplayOrder())
                                .primary(img.isPrimary())
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(p.getCreatedAt())
                .build();
    }

    private Set<ProductVariant> buildVariants(ProductRequest r, Product p) {
        if (r.getVariants() == null || r.getVariants().isEmpty()) {
            return new LinkedHashSet<>();
        }

        return r.getVariants().stream()
                .map(v -> {
                    validateVariantUniqueness(v, p.getId());
                    ProductVariant variant = ProductVariant.builder()
                            .product(p)
                            .size(v.getSize())
                            .colorName(v.getColorName())
                            .colorHex(v.getColorHex())
                            .stockQuantity(v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                            .sku(v.getSku())
                            .barcode(v.getBarcode() != null ? v.getBarcode() : v.getSku())
                            .variantPrice(v.getVariantPrice())
                            .variantOriginalPrice(v.getVariantOriginalPrice())
                            .imageUrl(v.getImageUrl())
                            .active(v.getActive() == null || v.getActive())
                            .build();

                    if (v.getColorName() != null) {
                        colorRepo.findByName(v.getColorName()).ifPresent(variant::setColor);
                    }
                    if (v.getSize() != null) {
                        sizeRepo.findBySizeValue(v.getSize()).ifPresent(variant::setSizeMaster);
                    }
                    return variant;
                })
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private void validateVariantUniqueness(VariantDTO v, Long productId) {
        if (v.getSku() != null) {
            variantRepo.findBySku(v.getSku()).ifPresent(existing -> {
                if (productId == null || existing.getProduct() == null
                        || !productId.equals(existing.getProduct().getId())) {
                    throw new RuntimeException("Duplicate SKU: " + v.getSku());
                }
            });
        }
        if (v.getBarcode() != null) {
            variantRepo.findByBarcode(v.getBarcode()).ifPresent(existing -> {
                if (productId == null || existing.getProduct() == null
                        || !productId.equals(existing.getProduct().getId())) {
                    throw new RuntimeException("Duplicate barcode: " + v.getBarcode());
                }
            });
        }
    }

    private void assignSubAndChildCategories(Product p, ProductRequest r) {
        if (r.getSubcategoryId() != null) {
            Category sub = catRepo.findById(r.getSubcategoryId())
                    .orElseThrow(() -> new RuntimeException("Subcategory not found"));
            p.setSubcategory(sub);
        } else {
            p.setSubcategory(null);
        }
        if (r.getChildCategoryId() != null) {
            Category child = catRepo.findById(r.getChildCategoryId())
                    .orElseThrow(() -> new RuntimeException("Child category not found"));
            p.setChildCategory(child);
        } else {
            p.setChildCategory(null);
        }
    }

    private void replaceImages(Product p, List<String> imageUrls) {
        if (imageUrls == null) {
            return;
        }
        int order = 0;
        for (String rawUrl : imageUrls) {
            String colorCode = extractColorCode(rawUrl);
            String cleanUrl = stripColorQuery(rawUrl);
            ProductImage image = ProductImage.builder()
                    .product(p)
                    .imageUrl(cleanUrl)
                    .colorCode(colorCode)
                    .displayOrder(order)
                    .isPrimary(order == 0)
                    .build();
            p.getImages().add(image);
            order++;
        }
    }

    private String extractColorCode(String url) {
        if (url == null || !url.contains("?clr=")) {
            return null;
        }
        int idx = url.toLowerCase().indexOf("?clr=");
        return url.substring(idx + 5).split("&")[0];
    }

    private String stripColorQuery(String url) {
        if (url == null || !url.contains("?clr=")) {
            return url;
        }
        return url.substring(0, url.toLowerCase().indexOf("?clr="));
    }

    private String slug(String n) {
        return n.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    private String generateUniqueSlug(String name) {
        String base = slug(name);
        String current = base;
        int count = 1;
        while (productRepo.findBySlugAndActiveTrue(current).isPresent()) {
            current = base + "-" + count;
            count++;
        }
        return current;
    }

    private String deduceTypeFromCategoryId(Long categoryId, Long subcategoryId) {
        if (subcategoryId != null) {
            return catRepo.findById(subcategoryId).map(c -> {
                String s = c.getSlug().toLowerCase();
                if (s.contains("scrub-suit") || s.contains("scrubs")) return "scrubs";
                if (s.contains("t-shirt") || s.contains("tshirt")) return "tshirts";
                if (s.contains("underscrub")) return "underscrub";
                if (s.contains("gown") || s.contains("cap")) return "surgical";
                return "scrubs";
            }).orElse("scrubs");
        }
        if (categoryId != null) {
            return catRepo.findById(categoryId).map(c -> {
                String s = c.getSlug().toLowerCase();
                if (s.contains("surgical")) return "surgical";
                if (s.contains("bulk")) return "bulk";
                return "scrubs";
            }).orElse("scrubs");
        }
        return "scrubs";
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
