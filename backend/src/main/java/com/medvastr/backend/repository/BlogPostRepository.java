package com.medvastr.backend.repository;

import com.medvastr.backend.model.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    Page<BlogPost> findByStatusOrderByPublishedAtDesc(BlogPost.PostStatus status, Pageable pageable);
    Optional<BlogPost> findBySlugAndStatus(String slug, BlogPost.PostStatus status);
    List<BlogPost> findTop4ByStatusAndIdNotOrderByPublishedAtDesc(BlogPost.PostStatus status, Long excludeId);
}
