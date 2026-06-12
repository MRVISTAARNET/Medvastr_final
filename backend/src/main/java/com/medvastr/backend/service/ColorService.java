package com.medvastr.backend.service;

import com.medvastr.backend.dto.ColorDTO;
import com.medvastr.backend.model.ProductColor;
import com.medvastr.backend.repository.ProductColorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ColorService {

    private final ProductColorRepository colorRepository;

    @Transactional(readOnly = true)
    public List<ColorDTO> getActive() {
        return colorRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream().map(ColorDTO::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ColorDTO> getAll() {
        return colorRepository.findAll().stream().map(ColorDTO::from).collect(Collectors.toList());
    }

    public ColorDTO create(ColorDTO dto) {
        ProductColor color = ProductColor.builder()
                .name(dto.getName())
                .hexCode(dto.getHexCode())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isActive(dto.isActive())
                .build();
        return ColorDTO.from(colorRepository.save(color));
    }

    public ColorDTO update(Long id, ColorDTO dto) {
        ProductColor color = colorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Color not found: " + id));
        color.setName(dto.getName());
        color.setHexCode(dto.getHexCode());
        color.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : color.getDisplayOrder());
        color.setActive(dto.isActive());
        return ColorDTO.from(colorRepository.save(color));
    }

    public void delete(Long id) {
        ProductColor color = colorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Color not found: " + id));
        color.setActive(false);
        colorRepository.save(color);
    }

    public void reorder(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            final int order = i;
            colorRepository.findById(orderedIds.get(i)).ifPresent(c -> {
                c.setDisplayOrder(order);
                colorRepository.save(c);
            });
        }
    }
}
