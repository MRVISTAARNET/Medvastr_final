package com.medvastr.service;

import com.medvastr.dto.ProductDTO;
import com.medvastr.dto.ProductFilterRequest;
import com.medvastr.dto.ProductRequest;
import com.medvastr.dto.ReviewDTO;
import com.medvastr.dto.VariantDTO;
import com.medvastr.model.Product;
import com.medvastr.model.ProductImage;
import com.medvastr.repository.CategoryRepository;
import com.medvastr.repository.ProductRepository;
import com.medvastr.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
                p
            )
            .map(this::toDTO);
    }

    public ProductDTO getById(Long id) {
        return toDTO(productRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found: " + id)));
    }

    public ProductDTO getBySlug(String slug) {
        return toDTO(
            productRepo.findBySlugAndActiveTrue(slug).orElseThrow(() -> new RuntimeException("Not found: " + slug))
        );
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
            .emoji(r.getEmoji())
            .bgColor(r.getBgColor())
            .fabricDetail(r.getFabricDetail())
            .stretchType(r.getStretchType())
            .pocketCount(r.getPocketCount())
            .careInstructions(r.getCareInstructions())
            .weight(r.getWeight())
            .fit(r.getFit())
            .slug(slug(r.getName()))
            .build();

        if (r.getCategoryId() != null) catRepo.findById(r.getCategoryId()).ifPresent(p::setCategory);
        
        // Handle Images
        if (r.getImageUrls() != null) {
            p.setImages(r.getImageUrls().stream()
                .map(url -> ProductImage.builder().imageUrl(url).product(p).build())
                .collect(Collectors.toList()));
        }

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
        p.setEmoji(r.getEmoji());
        p.setBgColor(r.getBgColor());
        p.setFabricDetail(r.getFabricDetail());
        p.setStretchType(r.getStretchType());
        p.setPocketCount(r.getPocketCount());
        p.setCareInstructions(r.getCareInstructions());
        p.setWeight(r.getWeight());
        p.setFit(r.getFit());

        if (r.getCategoryId() != null) catRepo.findById(r.getCategoryId()).ifPresent(p::setCategory);

        // Update Images (simple replacement)
        if (r.getImageUrls() != null) {
            p.getImages().clear();
            p.getImages().addAll(r.getImageUrls().stream()
                .map(url -> ProductImage.builder().imageUrl(url).product(p).build())
                .collect(Collectors.toList()));
        }

        return toDTO(productRepo.save(p));
    }

    @Transactional
    public void delete(Long id) {
        productRepo.findById(id).ifPresent(p -> {
            p.setActive(false);
            productRepo.save(p);
        });
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

    public ProductDTO toDTO(Product p) {
        return ProductDTO.builder()
            .id(p.getId())
            .name(p.getName())
            .slug(p.getSlug())
            .description(p.getDescription())
            .price(p.getPrice())
            .originalPrice(p.getOriginalPrice())
            .fabric(p.getFabric())
            .type(p.getType())
            .gender(p.getGender())
            .badge(p.getBadge())
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
            .variants(
                p.getVariants().stream()
                    .map(v -> VariantDTO.builder()
                        .id(v.getId())
                        .size(v.getSize())
                        .colorName(v.getColorName())
                        .colorHex(v.getColorHex())
                        .stockQuantity(v.getStockQuantity())
                        .sku(v.getSku())
                        .build())
                    .collect(Collectors.toList())
            )
            .imageUrls(p.getImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList()))
            .createdAt(p.getCreatedAt())
            .build();
    }

    private String slug(String n) {
        return n.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }
}
