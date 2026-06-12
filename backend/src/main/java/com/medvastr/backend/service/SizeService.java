package com.medvastr.backend.service;

import com.medvastr.backend.dto.SizeDTO;
import com.medvastr.backend.model.ProductSize;
import com.medvastr.backend.repository.ProductSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SizeService {

    private final ProductSizeRepository sizeRepository;

    @Transactional(readOnly = true)
    public List<SizeDTO> getActive() {
        return sizeRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream().map(SizeDTO::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SizeDTO> getAll() {
        return sizeRepository.findAll().stream().map(SizeDTO::from).collect(Collectors.toList());
    }

    public SizeDTO create(SizeDTO dto) {
        ProductSize size = ProductSize.builder()
                .name(dto.getName())
                .sizeValue(dto.getSizeValue())
                .category(dto.getCategory() != null ? dto.getCategory() : "APPAREL")
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isActive(dto.isActive())
                .build();
        return SizeDTO.from(sizeRepository.save(size));
    }

    public SizeDTO update(Long id, SizeDTO dto) {
        ProductSize size = sizeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found: " + id));
        size.setName(dto.getName());
        size.setSizeValue(dto.getSizeValue());
        if (dto.getCategory() != null) size.setCategory(dto.getCategory());
        size.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : size.getDisplayOrder());
        size.setActive(dto.isActive());
        return SizeDTO.from(sizeRepository.save(size));
    }

    public void delete(Long id) {
        ProductSize size = sizeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found: " + id));
        size.setActive(false);
        sizeRepository.save(size);
    }

    public void reorder(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            final int order = i;
            sizeRepository.findById(orderedIds.get(i)).ifPresent(s -> {
                s.setDisplayOrder(order);
                sizeRepository.save(s);
            });
        }
    }
}
