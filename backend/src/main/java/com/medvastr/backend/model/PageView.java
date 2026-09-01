package com.medvastr.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "page_views", indexes = {
    @Index(name = "idx_pv_session", columnList = "session_id"),
    @Index(name = "idx_pv_url", columnList = "pageUrl"),
    @Index(name = "idx_pv_time", columnList = "viewTime")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private VisitorSession session;

    @Column(nullable = false, length = 500)
    private String pageUrl;

    @Column(length = 255)
    private String pageTitle;

    @Builder.Default
    private boolean entry = false;

    @Builder.Default
    private boolean exit = false;

    @CreationTimestamp
    private LocalDateTime viewTime;

    @Builder.Default
    private Long durationSeconds = 0L;
}
