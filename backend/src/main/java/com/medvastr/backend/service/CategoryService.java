package com.medvastr.backend.service;

import com.medvastr.backend.dto.CategoryDTO;
import com.medvastr.backend.dto.CategoryRequest;
import com.medvastr.backend.model.Category;
import com.medvastr.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {
    private final CategoryRepository catRepo;

    public List<CategoryDTO> getAll() {
        return catRepo.findByActiveTrueOrderByDisplayOrderAsc().stream()
            .map(c -> CategoryDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .displayOrder(c.getDisplayOrder())
                .productCount(c.getProducts().size())
                .build())
            .collect(Collectors.toList());
    }

    public CategoryDTO getBySlug(String slug) {
        Category c = catRepo.findBySlugAndActiveTrue(slug).orElseThrow(() -> new RuntimeException("Not found: " + slug));
        return CategoryDTO.builder()
            .id(c.getId())
            .name(c.getName())
            .slug(c.getSlug())
            .description(c.getDescription())
            .imageUrl(c.getImageUrl())
            .displayOrder(c.getDisplayOrder())
            .build();
    }

    @Transactional
    public CategoryDTO create(CategoryRequest r) {
        Category c = Category.builder()
            .name(r.getName())
            .slug(r.getSlug())
            .description(r.getDescription())
            .imageUrl(r.getImageUrl())
            .displayOrder(r.getDisplayOrder() != null ? r.getDisplayOrder() : 0)
            .build();
        catRepo.save(c);
        return getBySlug(c.getSlug());
    }
}
