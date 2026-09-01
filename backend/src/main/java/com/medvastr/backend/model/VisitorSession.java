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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "visitor_sessions", indexes = {
    @Index(name = "idx_session_id", columnList = "sessionId"),
    @Index(name = "idx_visitor_id", columnList = "visitorId"),
    @Index(name = "idx_start_time", columnList = "startTime"),
    @Index(name = "idx_last_activity", columnList = "lastActivityTime"),
    @Index(name = "idx_traffic_source", columnList = "trafficSource"),
    @Index(name = "idx_device_type", columnList = "deviceType")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String sessionId;

    @Column(nullable = false, length = 100)
    private String visitorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 64)
    private String ipHash;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String region;

    @Column(length = 100)
    private String city;

    @Column(length = 20)
    private String deviceType; // DESKTOP, MOBILE, TABLET

    @Column(length = 50)
    private String browser;

    @Column(length = 50)
    private String os;

    @Column(columnDefinition = "TEXT")
    private String referrer;

    @Column(length = 150)
    private String referrerDomain;

    @Column(length = 30)
    private String trafficSource; // DIRECT, ORGANIC, SOCIAL, REFERRAL

    @Column(length = 500)
    private String entryPage;

    @Column(length = 500)
    private String exitPage;

    @Builder.Default
    private Integer pageViewsCount = 1;

    @Builder.Default
    private Integer eventsCount = 0;

    @CreationTimestamp
    private LocalDateTime startTime;

    private LocalDateTime lastActivityTime;

    private LocalDateTime endTime;

    @Builder.Default
    private Long durationSeconds = 0L;

    @Builder.Default
    private boolean isNewVisitor = true;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
