package com.medvastr.backend.service;

import com.medvastr.backend.dto.BannerDTO;
import com.medvastr.backend.model.Banner;
import com.medvastr.backend.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BannerService {
    private final BannerRepository bannerRepository;

    public List<BannerDTO> getAllActiveBanners() {
        return bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BannerDTO> getAllBanners() {
        return bannerRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BannerDTO> getBannersByPosition(Banner.BannerPosition position) {
        return bannerRepository.findByPositionAndIsActiveTrueOrderByDisplayOrderAsc(position)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public BannerDTO createBanner(BannerDTO dto) {
        Banner banner = Banner.builder()
                .title(dto.getTitle())
                .imageUrl(dto.getImageUrl())
                .linkUrl(dto.getLinkUrl())
                .position(dto.getPosition() != null ? dto.getPosition() : Banner.BannerPosition.HOME_TOP)
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        return toDTO(bannerRepository.save(banner));
    }

    public BannerDTO updateBanner(Long id, BannerDTO dto) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));

        banner.setTitle(dto.getTitle());
        banner.setImageUrl(dto.getImageUrl());
        banner.setLinkUrl(dto.getLinkUrl());
        banner.setPosition(dto.getPosition());
        banner.setDisplayOrder(dto.getDisplayOrder());
        banner.setActive(dto.isActive());

        return toDTO(bannerRepository.save(banner));
    }

    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    public void reorderBanners(List<Long> ids) {
        for (int i = 0; i < ids.size(); i++) {
            Banner banner = bannerRepository.findById(ids.get(i))
                    .orElseThrow(() -> new RuntimeException("Banner not found"));
            banner.setDisplayOrder(i);
            bannerRepository.save(banner);
        }
    }

    private BannerDTO toDTO(Banner banner) {
        return BannerDTO.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .imageUrl(banner.getImageUrl())
                .linkUrl(banner.getLinkUrl())
                .position(banner.getPosition())
                .displayOrder(banner.getDisplayOrder())
                .isActive(banner.isActive())
                .createdAt(banner.getCreatedAt())
                .build();
    }
}
