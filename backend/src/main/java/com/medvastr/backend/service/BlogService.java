package com.medvastr.backend.service;

import com.medvastr.backend.dto.BlogPostDTO;
import com.medvastr.backend.model.BlogCategory;
import com.medvastr.backend.model.BlogPost;
import com.medvastr.backend.repository.BlogCategoryRepository;
import com.medvastr.backend.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BlogService {

    private final BlogPostRepository postRepository;
    private final BlogCategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<BlogPostDTO> getPublished(Pageable pageable) {
        return postRepository.findByStatusOrderByPublishedAtDesc(BlogPost.PostStatus.PUBLISHED, pageable)
                .map(BlogPostDTO::summary);
    }

    @Transactional(readOnly = true)
    public BlogPostDTO getPublishedBySlug(String slug) {
        BlogPost post = postRepository.findBySlugAndStatus(slug, BlogPost.PostStatus.PUBLISHED)
                .orElseThrow(() -> new RuntimeException("Post not found: " + slug));
        return BlogPostDTO.from(post);
    }

    @Transactional(readOnly = true)
    public List<BlogPostDTO> getRelated(Long postId) {
        return postRepository.findTop4ByStatusAndIdNotOrderByPublishedAtDesc(
                        BlogPost.PostStatus.PUBLISHED, postId)
                .stream().map(BlogPostDTO::summary).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BlogPostDTO> getAllPosts() {
        return postRepository.findAll().stream().map(BlogPostDTO::from).collect(Collectors.toList());
    }

    public BlogPostDTO create(BlogPostDTO dto) {
        BlogPost post = mapToEntity(new BlogPost(), dto);
        if (dto.getStatus() == BlogPost.PostStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        return BlogPostDTO.from(postRepository.save(post));
    }

    public BlogPostDTO update(Long id, BlogPostDTO dto) {
        BlogPost post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found: " + id));
        BlogPost.PostStatus oldStatus = post.getStatus();
        mapToEntity(post, dto);
        if (dto.getStatus() == BlogPost.PostStatus.PUBLISHED
                && oldStatus != BlogPost.PostStatus.PUBLISHED
                && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        return BlogPostDTO.from(postRepository.save(post));
    }

    public void delete(Long id) {
        postRepository.deleteById(id);
    }

    // Categories
    @Transactional(readOnly = true)
    public List<BlogCategory> getCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    public BlogCategory createCategory(BlogCategory cat) {
        return categoryRepository.save(cat);
    }

    public BlogCategory updateCategory(Long id, BlogCategory updated) {
        BlogCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        cat.setName(updated.getName());
        cat.setSlug(updated.getSlug());
        cat.setDescription(updated.getDescription());
        cat.setDisplayOrder(updated.getDisplayOrder());
        cat.setActive(updated.isActive());
        return categoryRepository.save(cat);
    }

    private BlogPost mapToEntity(BlogPost post, BlogPostDTO dto) {
        post.setTitle(dto.getTitle());
        post.setSlug(dto.getSlug() != null ? dto.getSlug() : slugify(dto.getTitle()));
        post.setExcerpt(dto.getExcerpt());
        post.setContent(dto.getContent() != null ? dto.getContent() : "");
        post.setFeaturedImage(dto.getFeaturedImage());
        post.setAuthorName(dto.getAuthorName());
        if (dto.getStatus() != null) post.setStatus(dto.getStatus());
        post.setSeoTitle(dto.getSeoTitle());
        post.setSeoDescription(dto.getSeoDescription());
        if (dto.getPublishedAt() != null) post.setPublishedAt(dto.getPublishedAt());

        if (dto.getCategoryId() != null) {
            post.setCategory(categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Blog category not found")));
        }
        return post;
    }

    private String slugify(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }
}
