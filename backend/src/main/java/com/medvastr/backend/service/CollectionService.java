package com.medvastr.backend.service;

import com.medvastr.backend.dto.CollectionDTO;
import com.medvastr.backend.dto.ProductDTO;
import com.medvastr.backend.model.Collection;
import com.medvastr.backend.model.CollectionProduct;
import com.medvastr.backend.model.Product;
import com.medvastr.backend.repository.CollectionProductRepository;
import com.medvastr.backend.repository.CollectionRepository;
import com.medvastr.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CollectionService {
    private final CollectionRepository collectionRepository;
    private final CollectionProductRepository collectionProductRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public List<CollectionDTO> getAllActiveCollections() {
        return collectionRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(c -> toDTO(c, false))
                .collect(Collectors.toList());
    }

    public List<CollectionDTO> getAllCollections() {
        return collectionRepository.findAll().stream()
                .map(c -> toDTO(c, false))
                .collect(Collectors.toList());
    }

    public List<CollectionDTO> getCollectionsByType(Collection.CollectionType type) {
        return collectionRepository.findByCollectionTypeAndIsActiveTrueOrderByDisplayOrderAsc(type)
                .stream()
                .map(c -> toDTO(c, false))
                .collect(Collectors.toList());
    }

    public CollectionDTO getCollectionBySlug(String slug) {
        Collection collection = collectionRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        return toDTO(collection, true);
    }

    public CollectionDTO createCollection(CollectionDTO dto) {
        Collection collection = Collection.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .collectionType(
                        dto.getCollectionType() != null ? dto.getCollectionType() : Collection.CollectionType.CURATED)
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isActive(dto.isActive())
                .build();
        return toDTO(collectionRepository.save(collection), false);
    }

    public CollectionDTO updateCollection(Long id, CollectionDTO dto) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        collection.setName(dto.getName());
        collection.setSlug(dto.getSlug());
        collection.setDescription(dto.getDescription());
        collection.setImageUrl(dto.getImageUrl());
        collection.setCollectionType(dto.getCollectionType());
        collection.setDisplayOrder(dto.getDisplayOrder());
        collection.setActive(dto.isActive());

        return toDTO(collectionRepository.save(collection), false);
    }

    public void deleteCollection(Long id) {
        collectionRepository.deleteById(id);
    }

    public void addProductToCollection(Long collectionId, Long productId) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (collectionProductRepository.findByCollectionIdAndProductId(collectionId, productId).isPresent()) {
            throw new RuntimeException("Product already in collection");
        }

        CollectionProduct cp = CollectionProduct.builder()
                .collection(collection)
                .product(product)
                .displayOrder((int) collectionProductRepository.countByCollectionId(collectionId))
                .build();
        collectionProductRepository.save(cp);
    }

    public void removeProductFromCollection(Long collectionId, Long productId) {
        collectionProductRepository.deleteByCollectionAndProduct(collectionId, productId);
    }

    public void reorderProductsInCollection(Long collectionId, List<Long> productIds) {
        for (int i = 0; i < productIds.size(); i++) {
            CollectionProduct cp = collectionProductRepository
                    .findByCollectionIdAndProductId(collectionId, productIds.get(i))
                    .orElseThrow(() -> new RuntimeException("Product not in collection"));
            cp.setDisplayOrder(i);
            collectionProductRepository.save(cp);
        }
    }

    private CollectionDTO toDTO(Collection collection, boolean includeProducts) {
        List<ProductDTO> products = Collections.emptyList();
        int count = 0;

        if (includeProducts) {
            products = collectionProductRepository.findByCollectionIdOrderByDisplayOrderAsc(collection.getId())
                    .stream()
                    .map(CollectionProduct::getProduct)
                    .filter(Product::isActive)
                    .map(productService::toDTO)
                    .collect(Collectors.toList());
            count = products.size();
        } else {
            count = (int) collectionProductRepository.countByCollectionId(collection.getId());
        }

        return CollectionDTO.builder()
                .id(collection.getId())
                .name(collection.getName())
                .slug(collection.getSlug())
                .description(collection.getDescription())
                .imageUrl(collection.getImageUrl())
                .collectionType(collection.getCollectionType())
                .displayOrder(collection.getDisplayOrder())
                .isActive(collection.isActive())
                .productCount(count)
                .products(products)
                .createdAt(collection.getCreatedAt())
                .build();
    }
}
