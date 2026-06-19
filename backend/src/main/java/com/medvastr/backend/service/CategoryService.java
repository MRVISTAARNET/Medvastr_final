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
                .map(this::toFlatDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getTree() {
        return catRepo.findByParentIsNullAndActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toTreeDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getBySlug(String slug) {
        Category c = catRepo.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new RuntimeException("Not found: " + slug));
        return toTreeDTO(c);
    }

    public List<Long> getCategoryAndDescendantIds(Long categoryId) {
        List<Long> ids = new java.util.ArrayList<>();
        collectDescendantIds(categoryId, ids);
        return ids;
    }

    public List<Long> getCategoryAndDescendantIdsBySlug(String slug) {
        Category c = catRepo.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new RuntimeException("Not found: " + slug));
        return getCategoryAndDescendantIds(c.getId());
    }

    private void collectDescendantIds(Long categoryId, List<Long> ids) {
        ids.add(categoryId);
        catRepo.findByParentIdAndActiveTrueOrderByDisplayOrderAsc(categoryId)
                .forEach(child -> collectDescendantIds(child.getId(), ids));
    }

    @Transactional
    public CategoryDTO create(CategoryRequest r) {
        Category c = Category.builder()
                .name(r.getName())
                .slug(r.getSlug())
                .description(r.getDescription())
                .imageUrl(r.getImageUrl())
                .displayOrder(r.getDisplayOrder() != null ? r.getDisplayOrder() : 0)
                .navLabel(r.getNavLabel())
                .showInNav(r.getShowInNav() == null || r.getShowInNav())
                .build();
        if (r.getParentId() != null) {
            c.setParent(catRepo.findById(r.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found")));
        }
        catRepo.save(c);
        return getBySlug(c.getSlug());
    }

    @Transactional
    public CategoryDTO update(Long id, CategoryRequest r) {
        Category c = catRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
        if (r.getName() != null)
            c.setName(r.getName());
        if (r.getSlug() != null)
            c.setSlug(r.getSlug());
        if (r.getDescription() != null)
            c.setDescription(r.getDescription());
        if (r.getImageUrl() != null)
            c.setImageUrl(r.getImageUrl());
        if (r.getDisplayOrder() != null)
            c.setDisplayOrder(r.getDisplayOrder());
        if (r.getNavLabel() != null)
            c.setNavLabel(r.getNavLabel());
        if (r.getShowInNav() != null)
            c.setShowInNav(r.getShowInNav());
        if (r.getParentId() != null) {
            c.setParent(catRepo.findById(r.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found")));
        }
        catRepo.save(c);
        return toTreeDTO(c);
    }

    @Transactional
    public void delete(Long id) {
        Category c = catRepo.findById(id).orElseThrow(() -> new RuntimeException("Category not found: " + id));
        // Hard delete as requested. Database constraint will catch if products exist.
        catRepo.delete(c);
    }

    private CategoryDTO toFlatDTO(Category c) {
        return CategoryDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .displayOrder(c.getDisplayOrder())
                .productCount(c.getProducts() != null ? c.getProducts().size() : 0)
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .parentName(c.getParent() != null ? c.getParent().getName() : null)
                .navLabel(c.getNavLabel())
                .showInNav(c.isShowInNav())
                .build();
    }

    private CategoryDTO toTreeDTO(Category c) {
        CategoryDTO dto = toFlatDTO(c);
        List<Category> children = catRepo.findByParentIdAndActiveTrueOrderByDisplayOrderAsc(c.getId());
        if (!children.isEmpty()) {
            dto.setChildren(children.stream().map(this::toTreeDTO).collect(Collectors.toList()));
        }
        return dto;
    }
}
