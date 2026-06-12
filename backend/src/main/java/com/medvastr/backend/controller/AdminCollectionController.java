package com.medvastr.backend.controller;

import com.medvastr.backend.dto.CollectionDTO;
import com.medvastr.backend.model.Collection;
import com.medvastr.backend.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/collections")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminCollectionController {
    private final CollectionService collectionService;

    @GetMapping
    public ResponseEntity<List<CollectionDTO>> getAllCollections() {
        return ResponseEntity.ok(collectionService.getAllCollections());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCollectionById(@PathVariable Long id) {
        try {
            List<CollectionDTO> collections = collectionService.getAllActiveCollections();
            CollectionDTO collection = collections.stream()
                    .filter(c -> c.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Collection not found"));
            return ResponseEntity.ok(collection);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createCollection(@RequestBody CollectionDTO dto) {
        try {
            CollectionDTO created = collectionService.createCollection(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating collection: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCollection(@PathVariable Long id, @RequestBody CollectionDTO dto) {
        try {
            CollectionDTO updated = collectionService.updateCollection(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating collection: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCollection(@PathVariable Long id) {
        try {
            collectionService.deleteCollection(id);
            return ResponseEntity.ok("Collection deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting collection: " + e.getMessage());
        }
    }

    @PostMapping("/{collectionId}/products/{productId}")
    public ResponseEntity<?> addProductToCollection(@PathVariable Long collectionId, @PathVariable Long productId) {
        try {
            collectionService.addProductToCollection(collectionId, productId);
            return ResponseEntity.ok("Product added to collection");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding product: " + e.getMessage());
        }
    }

    @DeleteMapping("/{collectionId}/products/{productId}")
    public ResponseEntity<?> removeProductFromCollection(@PathVariable Long collectionId, @PathVariable Long productId) {
        try {
            collectionService.removeProductFromCollection(collectionId, productId);
            return ResponseEntity.ok("Product removed from collection");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error removing product: " + e.getMessage());
        }
    }

    @PostMapping("/{collectionId}/reorder-products")
    public ResponseEntity<?> reorderProductsInCollection(@PathVariable Long collectionId, @RequestBody List<Long> productIds) {
        try {
            collectionService.reorderProductsInCollection(collectionId, productIds);
            return ResponseEntity.ok("Products reordered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error reordering products: " + e.getMessage());
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<?> getCollectionsByType(@PathVariable String type) {
        try {
            Collection.CollectionType collectionType = Collection.CollectionType.valueOf(type.toUpperCase());
            List<CollectionDTO> collections = collectionService.getCollectionsByType(collectionType);
            return ResponseEntity.ok(collections);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid collection type: " + e.getMessage());
        }
    }
}
