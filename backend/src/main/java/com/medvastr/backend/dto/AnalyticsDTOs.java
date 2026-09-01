package com.medvastr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class AnalyticsDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrackRequest {
        private String visitorId;
        private String sessionId;
        private String pageUrl;
        private String pageTitle;
        private String referrer;
        private String eventType; // PAGE_VIEW, PRODUCT_VIEW, SEARCH, ADD_TO_CART, REMOVE_FROM_CART, WISHLIST_ADD, CHECKOUT_STARTED, PAYMENT_INITIATED, ORDER_CREATED, LOGIN, REGISTER
        private String eventData; // JSON metadata
        private Long durationSeconds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyticsOverviewDTO {
        private long totalVisitors;
        private long uniqueVisitors;
        private long totalSessions;
        private long totalPageViews;
        private long newVisitors;
        private long returningVisitors;
        private double avgSessionDurationSeconds;
        private double bounceRatePercent;
        private long totalOrders;
        private double conversionRatePercent;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrafficSourceItem {
        private String source; // DIRECT, ORGANIC, SOCIAL, REFERRAL
        private long count;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopPageItem {
        private String pageUrl;
        private String pageTitle;
        private long views;
        private long uniqueVisitors;
        private double avgTimeSeconds;
        private long entryVisits;
        private long exitVisits;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceStatItem {
        private String name;
        private long count;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceReportDTO {
        private List<DeviceStatItem> deviceTypes;
        private List<DeviceStatItem> browsers;
        private List<DeviceStatItem> operatingSystems;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeoStatItem {
        private String location;
        private long visitors;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeoReportDTO {
        private List<GeoStatItem> countries;
        private List<GeoStatItem> cities;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActiveVisitorItem {
        private String sessionId;
        private String visitorId;
        private String userEmail;
        private String userName;
        private String currentPage;
        private String deviceType;
        private String browser;
        private String os;
        private String city;
        private LocalDateTime lastActivityTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityEventDTO {
        private Long id;
        private String eventType;
        private String eventData;
        private String pageUrl;
        private String visitorId;
        private String userEmail;
        private String deviceType;
        private String browser;
        private String trafficSource;
        private LocalDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyTrendItem {
        private String date; // YYYY-MM-DD
        private long visitors;
        private long sessions;
        private long pageViews;
        private long orders;
    }
}
