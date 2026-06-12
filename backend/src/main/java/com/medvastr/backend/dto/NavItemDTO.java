package com.medvastr.backend.dto;

import com.medvastr.backend.model.NavItem;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NavItemDTO {
    private Long id;
    private String label;
    private String href;
    private Long parentId;
    private NavItem.ItemType itemType;
    private Long categoryId;
    private String categorySlug;
    private String gender;
    private Integer displayOrder;
    private boolean active;
    private boolean openNewTab;
    private List<NavItemDTO> children;

    public static NavItemDTO from(NavItem item) {
        return NavItemDTO.builder()
                .id(item.getId())
                .label(item.getLabel())
                .href(item.getHref())
                .parentId(item.getParent() != null ? item.getParent().getId() : null)
                .itemType(item.getItemType())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categorySlug(item.getCategory() != null ? item.getCategory().getSlug() : null)
                .gender(item.getGender())
                .displayOrder(item.getDisplayOrder())
                .active(item.isActive())
                .openNewTab(item.isOpenNewTab())
                .children(item.getChildren() != null
                        ? item.getChildren().stream()
                                .filter(NavItem::isActive)
                                .map(NavItemDTO::from)
                                .collect(Collectors.toList())
                        : List.of())
                .build();
    }
}
