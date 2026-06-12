package com.medvastr.backend.service;

import com.medvastr.backend.dto.NavItemDTO;
import com.medvastr.backend.model.Category;
import com.medvastr.backend.model.NavItem;
import com.medvastr.backend.repository.CategoryRepository;
import com.medvastr.backend.repository.NavItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NavItemService {

    private final NavItemRepository navItemRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<NavItemDTO> getActiveTree() {
        return navItemRepository.findByParentIsNullAndActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(NavItemDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NavItemDTO> getAll() {
        return navItemRepository.findAll().stream()
                .map(NavItemDTO::from)
                .collect(Collectors.toList());
    }

    public NavItemDTO create(NavItemDTO dto) {
        NavItem item = mapToEntity(new NavItem(), dto);
        return NavItemDTO.from(navItemRepository.save(item));
    }

    public NavItemDTO update(Long id, NavItemDTO dto) {
        NavItem item = navItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav item not found: " + id));
        return NavItemDTO.from(navItemRepository.save(mapToEntity(item, dto)));
    }

    public void delete(Long id) {
        navItemRepository.deleteById(id);
    }

    public void reorder(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            final int order = i;
            navItemRepository.findById(orderedIds.get(i)).ifPresent(item -> {
                item.setDisplayOrder(order);
                navItemRepository.save(item);
            });
        }
    }

    private NavItem mapToEntity(NavItem item, NavItemDTO dto) {
        item.setLabel(dto.getLabel());
        item.setHref(dto.getHref());
        item.setItemType(dto.getItemType() != null ? dto.getItemType() : NavItem.ItemType.LINK);
        item.setGender(dto.getGender());
        item.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        item.setActive(dto.isActive());
        item.setOpenNewTab(dto.isOpenNewTab());

        if (dto.getParentId() != null) {
            item.setParent(navItemRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent nav item not found")));
        } else {
            item.setParent(null);
        }

        if (dto.getCategoryId() != null) {
            Category cat = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            item.setCategory(cat);
        } else {
            item.setCategory(null);
        }

        return item;
    }
}
