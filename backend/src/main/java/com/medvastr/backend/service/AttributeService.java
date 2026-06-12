package com.medvastr.backend.service;

import com.medvastr.backend.dto.AttributeDTO;
import com.medvastr.backend.model.ProductAttribute;
import com.medvastr.backend.model.ProductAttributeValue;
import com.medvastr.backend.repository.ProductAttributeRepository;
import com.medvastr.backend.repository.ProductAttributeValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AttributeService {

    private final ProductAttributeRepository attributeRepository;
    private final ProductAttributeValueRepository valueRepository;

    @Transactional(readOnly = true)
    public List<AttributeDTO> getFilterable() {
        return attributeRepository.findByFilterableTrueAndActiveTrueOrderByDisplayOrderAsc()
                .stream().map(AttributeDTO::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttributeDTO> getAll() {
        return attributeRepository.findAll().stream().map(AttributeDTO::from).collect(Collectors.toList());
    }

    public AttributeDTO create(AttributeDTO dto) {
        ProductAttribute attr = ProductAttribute.builder()
                .name(dto.getName())
                .slug(dto.getSlug() != null ? dto.getSlug() : slugify(dto.getName()))
                .attributeType(dto.getAttributeType() != null ? dto.getAttributeType() : ProductAttribute.AttributeType.SELECT)
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .active(dto.isActive())
                .filterable(dto.isFilterable())
                .build();
        return AttributeDTO.from(attributeRepository.save(attr));
    }

    public AttributeDTO update(Long id, AttributeDTO dto) {
        ProductAttribute attr = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attribute not found: " + id));
        attr.setName(dto.getName());
        if (dto.getSlug() != null) attr.setSlug(dto.getSlug());
        if (dto.getAttributeType() != null) attr.setAttributeType(dto.getAttributeType());
        attr.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : attr.getDisplayOrder());
        attr.setActive(dto.isActive());
        attr.setFilterable(dto.isFilterable());
        return AttributeDTO.from(attributeRepository.save(attr));
    }

    public void delete(Long id) {
        ProductAttribute attr = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attribute not found: " + id));
        attr.setActive(false);
        attributeRepository.save(attr);
    }

    public AttributeDTO.AttributeValueDTO addValue(Long attributeId, AttributeDTO.AttributeValueDTO dto) {
        ProductAttribute attr = attributeRepository.findById(attributeId)
                .orElseThrow(() -> new RuntimeException("Attribute not found"));
        ProductAttributeValue val = ProductAttributeValue.builder()
                .attribute(attr)
                .value(dto.getValue())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .active(dto.isActive())
                .build();
        ProductAttributeValue saved = valueRepository.save(val);
        return AttributeDTO.AttributeValueDTO.builder()
                .id(saved.getId())
                .value(saved.getValue())
                .displayOrder(saved.getDisplayOrder())
                .active(saved.isActive())
                .build();
    }

    public void deleteValue(Long valueId) {
        valueRepository.findById(valueId).ifPresent(v -> {
            v.setActive(false);
            valueRepository.save(v);
        });
    }

    private String slugify(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
