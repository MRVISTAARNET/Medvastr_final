package com.medvastr.backend.dto;

import com.medvastr.backend.model.BlogPost;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostDTO {
    private Long id;
    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String featuredImage;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String authorName;
    private BlogPost.PostStatus status;
    private String seoTitle;
    private String seoDescription;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;

    public static BlogPostDTO from(BlogPost p) {
        return BlogPostDTO.builder()
                .id(p.getId())
                .title(p.getTitle())
                .slug(p.getSlug())
                .excerpt(p.getExcerpt())
                .content(p.getContent())
                .featuredImage(p.getFeaturedImage())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .categorySlug(p.getCategory() != null ? p.getCategory().getSlug() : null)
                .authorName(p.getAuthorName())
                .status(p.getStatus())
                .seoTitle(p.getSeoTitle())
                .seoDescription(p.getSeoDescription())
                .publishedAt(p.getPublishedAt())
                .createdAt(p.getCreatedAt())
                .build();
    }

    public static BlogPostDTO summary(BlogPost p) {
        return BlogPostDTO.builder()
                .id(p.getId())
                .title(p.getTitle())
                .slug(p.getSlug())
                .excerpt(p.getExcerpt())
                .featuredImage(p.getFeaturedImage())
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .categorySlug(p.getCategory() != null ? p.getCategory().getSlug() : null)
                .authorName(p.getAuthorName())
                .publishedAt(p.getPublishedAt())
                .build();
    }
}
