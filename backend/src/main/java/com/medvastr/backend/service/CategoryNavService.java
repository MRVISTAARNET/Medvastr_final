package com.medvastr.backend.service;

import com.medvastr.backend.dto.NavItemDTO;
import com.medvastr.backend.model.Category;
import com.medvastr.backend.model.NavItem;
import com.medvastr.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryNavService {

    private final CategoryRepository categoryRepository;

    private static final List<StaticNavLink> STATIC_LINKS = List.of(
            new StaticNavLink("About Us", "/about", 100),
            new StaticNavLink("Blogs", "/blog", 101),
            new StaticNavLink("Contact Us", "/contact", 102));

    public List<NavItemDTO> buildNavigation() {
        List<NavItemDTO> items = new ArrayList<>();
        List<Category> roots = categoryRepository.findByParentIsNullAndActiveTrueOrderByDisplayOrderAsc();
        for (Category root : roots) {
            if (!root.isShowInNav()) {
                continue;
            }
            items.add(toNavItem(root));
        }
        for (StaticNavLink link : STATIC_LINKS) {
            items.add(NavItemDTO.builder()
                    .id(-link.order)
                    .label(link.label)
                    .href(link.href)
                    .itemType(NavItem.ItemType.LINK)
                    .displayOrder(link.order)
                    .active(true)
                    .children(List.of())
                    .build());
        }
        return items;
    }

    private NavItemDTO toNavItem(Category category) {
        boolean isBulk = category.getSlug() != null
                && (category.getSlug().equals("bulk-orders") || category.getSlug().equals("bulk-order"));
        String gender = resolveGender(category);
        NavItem.ItemType type = isBulk ? NavItem.ItemType.MEGA_MENU : NavItem.ItemType.MEGA_MENU;
        String href = isBulk ? "/bulk-orders" : "/" + category.getSlug();

        return NavItemDTO.builder()
                .id(category.getId())
                .label(category.getNavLabel() != null ? category.getNavLabel() : category.getName())
                .href(href)
                .itemType(type)
                .categoryId(category.getId())
                .categorySlug(category.getSlug())
                .gender(gender)
                .displayOrder(category.getDisplayOrder())
                .active(true)
                .children(buildChildren(category))
                .build();
    }

    private List<NavItemDTO> buildChildren(Category parent) {
        return categoryRepository.findByParentIdAndActiveTrueOrderByDisplayOrderAsc(parent.getId()).stream()
                .filter(Category::isShowInNav)
                .map(child -> {
                    List<NavItemDTO> grandChildren = categoryRepository
                            .findByParentIdAndActiveTrueOrderByDisplayOrderAsc(child.getId()).stream()
                            .filter(Category::isShowInNav)
                            .map(grand -> NavItemDTO.builder()
                                    .id(grand.getId())
                                    .label(grand.getNavLabel() != null ? grand.getNavLabel() : grand.getName())
                                    .href(buildCategoryHref(parent, child, grand))
                                    .itemType(NavItem.ItemType.LINK)
                                    .categoryId(grand.getId())
                                    .categorySlug(grand.getSlug())
                                    .displayOrder(grand.getDisplayOrder())
                                    .active(true)
                                    .children(List.of())
                                    .build())
                            .toList();

                    return NavItemDTO.builder()
                            .id(child.getId())
                            .label(child.getNavLabel() != null ? child.getNavLabel() : child.getName())
                            .href(buildCategoryHref(parent, child, null))
                            .itemType(grandChildren.isEmpty() ? NavItem.ItemType.LINK : NavItem.ItemType.DROPDOWN)
                            .categoryId(child.getId())
                            .categorySlug(child.getSlug())
                            .displayOrder(child.getDisplayOrder())
                            .active(true)
                            .children(grandChildren)
                            .build();
                })
                .toList();
    }

    private String buildCategoryHref(Category root, Category child, Category grand) {
        if (root.getSlug() != null && (root.getSlug().equals("bulk-orders") || root.getSlug().equals("bulk-order"))) {
            Category target = grand != null ? grand : child;
            return "/bulk-orders/" + target.getSlug();
        }
        String rootSeg = root.getSlug();
        String childSeg = segmentAfterParent(root, child);
        if (grand == null) {
            return "/" + rootSeg + "/" + childSeg;
        }
        return "/" + rootSeg + "/" + childSeg + "/" + segmentAfterParent(child, grand);
    }

    private String segmentAfterParent(Category parent, Category child) {
        if (child.getSlug() == null) {
            return child.getName().toLowerCase().replaceAll("\\s+", "-");
        }
        String prefix = parent.getSlug() + "-";
        if (child.getSlug().startsWith(prefix)) {
            return child.getSlug().substring(prefix.length());
        }
        return child.getSlug();
    }

    private String resolveGender(Category category) {
        if (category.getSlug() == null) {
            return null;
        }
        if (category.getSlug().equals("men")) {
            return "men";
        }
        if (category.getSlug().equals("women")) {
            return "women";
        }
        return null;
    }

    private record StaticNavLink(String label, String href, int order) {
    }
}
