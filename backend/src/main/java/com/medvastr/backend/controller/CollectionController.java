package com.medvastr.backend.controller;

import com.medvastr.backend.dto.CollectionDTO;
import com.medvastr.backend.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CollectionController {
    private final CollectionService collectionService;

    @GetMapping
    public ResponseEntity<List<CollectionDTO>> getAllCollections() {
        List<CollectionDTO> collections = collectionService.getAllActiveCollections();
        return ResponseEntity.ok(collections);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getCollectionBySlug(@PathVariable String slug) {
        try {
            CollectionDTO collection = collectionService.getCollectionBySlug(slug);
            return ResponseEntity.ok(collection);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<?> getCollectionsByType(@PathVariable String type) {
        try {
            com.medvastr.backend.model.Collection.CollectionType collectionType = 
                    com.medvastr.backend.model.Collection.CollectionType.valueOf(type.toUpperCase());
            List<CollectionDTO> collections = collectionService.getCollectionsByType(collectionType);
            return ResponseEntity.ok(collections);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid collection type: " + e.getMessage());
        }
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<CollectionDTO>> getNewArrivals() {
        List<CollectionDTO> collections = collectionService.getCollectionsByType(
                com.medvastr.backend.model.Collection.CollectionType.NEW_ARRIVALS
        );
        return ResponseEntity.ok(collections);
    }

    @GetMapping("/trending")
    public ResponseEntity<List<CollectionDTO>> getTrending() {
        List<CollectionDTO> collections = collectionService.getCollectionsByType(
                com.medvastr.backend.model.Collection.CollectionType.TRENDING
        );
        return ResponseEntity.ok(collections);
    }

    @GetMapping("/bulk-orders")
    public ResponseEntity<List<CollectionDTO>> getBulkOrders() {
        List<CollectionDTO> collections = collectionService.getCollectionsByType(
                com.medvastr.backend.model.Collection.CollectionType.BULK_ORDER
        );
        return ResponseEntity.ok(collections);
    }
}
