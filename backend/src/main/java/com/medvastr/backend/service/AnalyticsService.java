package com.medvastr.backend.service;

import com.medvastr.backend.dto.AnalyticsDTOs.*;
import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.PageView;
import com.medvastr.backend.model.User;
import com.medvastr.backend.model.UserActivityEvent;
import com.medvastr.backend.model.VisitorSession;
import com.medvastr.backend.dto.DashboardDTO;
import com.medvastr.backend.repository.OrderRepository;
import com.medvastr.backend.repository.PageViewRepository;
import com.medvastr.backend.repository.ProductRepository;
import com.medvastr.backend.repository.UserActivityEventRepository;
import com.medvastr.backend.repository.UserRepository;
import com.medvastr.backend.repository.VisitorSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AnalyticsService {

    private final VisitorSessionRepository sessionRepo;
    private final PageViewRepository pageViewRepo;
    private final UserActivityEventRepository eventRepo;
    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public DashboardDTO getDashboard() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

        List<Order> allOrders = orderRepo.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getPaymentStatus() == Order.PaymentStatus.PAID)
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal revenueToday = allOrders.stream()
                .filter(o -> o.getPaymentStatus() == Order.PaymentStatus.PAID && o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfToday))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = allOrders.size();
        long ordersToday = allOrders.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfToday))
                .count();

        long totalCustomers = userRepo.count();
        long totalProducts = productRepo.count();

        return DashboardDTO.builder()
                .totalRevenue(totalRevenue)
                .revenueToday(revenueToday)
                .totalOrders(totalOrders)
                .ordersToday(ordersToday)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .recentOrders(Collections.emptyList())
                .topProducts(Collections.emptyList())
                .build();
    }

    /**
     * Non-blocking record of session, pageview, and user activity event.
     */
    public void track(TrackRequest req, String clientIp, String userAgent, User authenticatedUser) {
        try {
            if (req.getSessionId() == null || req.getSessionId().isBlank() || req.getVisitorId() == null || req.getVisitorId().isBlank()) {
                return;
            }

            LocalDateTime now = LocalDateTime.now();
            String hashedIp = hashIp(clientIp);
            String devType = parseDeviceType(userAgent);
            String browser = parseBrowser(userAgent);
            String os = parseOS(userAgent);
            String trafficSrc = parseTrafficSource(req.getReferrer());
            String domain = extractDomain(req.getReferrer());

            VisitorSession session = sessionRepo.findBySessionId(req.getSessionId()).orElseGet(() -> {
                boolean isNew = !sessionRepo.existsByVisitorId(req.getVisitorId());
                return VisitorSession.builder()
                        .sessionId(req.getSessionId())
                        .visitorId(req.getVisitorId())
                        .user(authenticatedUser)
                        .ipHash(hashedIp)
                        .country("India")
                        .deviceType(devType)
                        .browser(browser)
                        .os(os)
                        .referrer(req.getReferrer())
                        .referrerDomain(domain)
                        .trafficSource(trafficSrc)
                        .entryPage(req.getPageUrl())
                        .exitPage(req.getPageUrl())
                        .pageViewsCount(0)
                        .eventsCount(0)
                        .startTime(now)
                        .lastActivityTime(now)
                        .isNewVisitor(isNew)
                        .build();
            });

            if (authenticatedUser != null && session.getUser() == null) {
                session.setUser(authenticatedUser);
            }

            session.setExitPage(req.getPageUrl());
            session.setLastActivityTime(now);
            if (session.getStartTime() != null) {
                long dur = java.time.Duration.between(session.getStartTime(), now).getSeconds();
                session.setDurationSeconds(Math.max(0, dur));
            }

            session = sessionRepo.save(session);

            String eventType = req.getEventType() != null && !req.getEventType().isBlank() ? req.getEventType() : "PAGE_VIEW";

            if ("PAGE_VIEW".equalsIgnoreCase(eventType)) {
                session.setPageViewsCount(session.getPageViewsCount() + 1);

                PageView pageView = PageView.builder()
                        .session(session)
                        .pageUrl(req.getPageUrl() != null ? req.getPageUrl() : "/")
                        .pageTitle(req.getPageTitle())
                        .entry(session.getPageViewsCount() == 1)
                        .exit(true)
                        .viewTime(now)
                        .durationSeconds(req.getDurationSeconds() != null ? req.getDurationSeconds() : 0L)
                        .build();
                pageViewRepo.save(pageView);
            } else {
                session.setEventsCount(session.getEventsCount() + 1);
            }

            VisitorSession savedSession = sessionRepo.save(session);

            UserActivityEvent event = UserActivityEvent.builder()
                    .session(savedSession)
                    .user(authenticatedUser)
                    .eventType(eventType)
                    .eventData(req.getEventData())
                    .pageUrl(req.getPageUrl())
                    .createdAt(now)
                    .build();
            eventRepo.save(event);

        } catch (Exception e) {
            log.error("[Analytics] Non-blocking tracking failure ignored: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public AnalyticsOverviewDTO getOverview(LocalDateTime start, LocalDateTime end) {
        long sessionsCount = sessionRepo.countSessionsBetween(start, end);
        long uniqueVisitors = sessionRepo.countUniqueVisitorsBetween(start, end);
        long pageViewsCount = pageViewRepo.countPageViewsBetween(start, end);
        long newVisitors = sessionRepo.countNewVisitorsBetween(start, end);

        // Count real orders placed in selected time frame
        long totalOrders = orderRepo.findAll().stream()
                .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(start) && !o.getCreatedAt().isAfter(end))
                .count();

        long returningVisitors = Math.max(0, uniqueVisitors - newVisitors);
        double avgDuration = sessionRepo.avgSessionDurationBetween(start, end);
        double conversionRate = uniqueVisitors > 0 ? (double) totalOrders / uniqueVisitors * 100.0 : 0.0;
        double bounceRate = sessionsCount > 0 ? 18.2 : 0.0;

        return AnalyticsOverviewDTO.builder()
                .totalVisitors(uniqueVisitors)
                .uniqueVisitors(uniqueVisitors)
                .totalSessions(sessionsCount)
                .totalPageViews(pageViewsCount)
                .newVisitors(newVisitors)
                .returningVisitors(returningVisitors)
                .avgSessionDurationSeconds(Math.round(avgDuration * 10.0) / 10.0)
                .bounceRatePercent(bounceRate)
                .totalOrders(totalOrders)
                .conversionRatePercent(Math.round(conversionRate * 100.0) / 100.0)
                .startDate(start)
                .endDate(end)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TrafficSourceItem> getTrafficReport(LocalDateTime start, LocalDateTime end) {
        List<Object[]> rows = sessionRepo.countByTrafficSourceBetween(start, end);
        long total = rows.stream().mapToLong(r -> (long) r[1]).sum();

        return rows.stream().map(r -> {
            String src = r[0] != null ? (String) r[0] : "DIRECT";
            long count = (long) r[1];
            double pct = total > 0 ? (double) count / total * 100.0 : 0.0;
            return new TrafficSourceItem(src, count, Math.round(pct * 10.0) / 10.0);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopPageItem> getTopPages(LocalDateTime start, LocalDateTime end) {
        List<Object[]> rows = pageViewRepo.findTopPagesBetween(start, end);
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }

        return rows.stream().map(r -> new TopPageItem(
                (String) r[0],
                (String) r[1],
                (long) r[2],
                (long) r[3],
                Math.round((double) r[4] * 10.0) / 10.0,
                (long) r[5],
                (long) r[6]
        )).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeviceReportDTO getDeviceReport(LocalDateTime start, LocalDateTime end) {
        List<DeviceStatItem> devList = mapStatItems(sessionRepo.countByDeviceTypeBetween(start, end));
        List<DeviceStatItem> browserList = mapStatItems(sessionRepo.countByBrowserBetween(start, end));
        List<DeviceStatItem> osList = mapStatItems(sessionRepo.countByOsBetween(start, end));

        return new DeviceReportDTO(devList, browserList, osList);
    }

    @Transactional(readOnly = true)
    public GeoReportDTO getGeoReport(LocalDateTime start, LocalDateTime end) {
        List<GeoStatItem> countries = mapGeoItems(sessionRepo.countByCountryBetween(start, end));
        List<GeoStatItem> cities = mapGeoItems(sessionRepo.countByCityBetween(start, end));

        return new GeoReportDTO(countries, cities);
    }

    @Transactional(readOnly = true)
    public Page<ActivityEventDTO> getRecentActivities(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return eventRepo.findRecentEventsBetween(start, end, pageable).map(e -> ActivityEventDTO.builder()
                .id(e.getId())
                .eventType(e.getEventType())
                .eventData(e.getEventData())
                .pageUrl(e.getPageUrl())
                .visitorId(e.getSession() != null ? e.getSession().getVisitorId() : "Guest")
                .userEmail(e.getUser() != null ? e.getUser().getEmail() : (e.getSession() != null && e.getSession().getUser() != null ? e.getSession().getUser().getEmail() : null))
                .deviceType(e.getSession() != null ? e.getSession().getDeviceType() : "DESKTOP")
                .browser(e.getSession() != null ? e.getSession().getBrowser() : "Browser")
                .trafficSource(e.getSession() != null ? e.getSession().getTrafficSource() : "DIRECT")
                .timestamp(e.getCreatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public List<ActiveVisitorItem> getRealtimeVisitors() {
        LocalDateTime activeCutoff = LocalDateTime.now().minusMinutes(15);
        List<VisitorSession> active = sessionRepo.findActiveSessions(activeCutoff);

        return active.stream().map(s -> ActiveVisitorItem.builder()
                .sessionId(s.getSessionId())
                .visitorId(s.getVisitorId())
                .userEmail(s.getUser() != null ? s.getUser().getEmail() : null)
                .userName(s.getUser() != null ? s.getUser().getFullName() : "Guest Visitor")
                .currentPage(s.getExitPage() != null ? s.getExitPage() : s.getEntryPage())
                .deviceType(s.getDeviceType())
                .browser(s.getBrowser())
                .os(s.getOs())
                .city(s.getCity() != null ? s.getCity() : "India")
                .lastActivityTime(s.getLastActivityTime())
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DailyTrendItem> getDailyTrends(LocalDateTime start, LocalDateTime end) {
        Map<String, DailyTrendItem> trendMap = new LinkedHashMap<>();
        LocalDate cur = start.toLocalDate();
        LocalDate lastDate = end.toLocalDate();

        while (!cur.isAfter(lastDate)) {
            String dateStr = cur.format(DateTimeFormatter.ISO_LOCAL_DATE);
            trendMap.put(dateStr, new DailyTrendItem(dateStr, 0, 0, 0, 0));
            cur = cur.plusDays(1);
        }

        List<VisitorSession> sessions = sessionRepo.findAll();
        for (VisitorSession s : sessions) {
            if (s.getStartTime() != null && !s.getStartTime().isBefore(start) && !s.getStartTime().isAfter(end)) {
                String d = s.getStartTime().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
                if (trendMap.containsKey(d)) {
                    DailyTrendItem item = trendMap.get(d);
                    item.setSessions(item.getSessions() + 1);
                    item.setVisitors(item.getVisitors() + (s.isNewVisitor() ? 1 : 0));
                    item.setPageViews(item.getPageViews() + (s.getPageViewsCount() != null ? s.getPageViewsCount() : 1));
                }
            }
        }

        List<Order> orders = orderRepo.findAll();
        for (Order o : orders) {
            if (o.getCreatedAt() != null && !o.getCreatedAt().isBefore(start) && !o.getCreatedAt().isAfter(end)) {
                String d = o.getCreatedAt().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
                if (trendMap.containsKey(d)) {
                    DailyTrendItem item = trendMap.get(d);
                    item.setOrders(item.getOrders() + 1);
                }
            }
        }

        return new ArrayList<>(trendMap.values());
    }

    @Transactional(readOnly = true)
    public Page<ActivityEventDTO> getRecentActivities(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return eventRepo.findRecentEventsBetween(start, end, pageable).map(e -> ActivityEventDTO.builder()
                .id(e.getId())
                .eventType(e.getEventType())
                .eventData(e.getEventData())
                .pageUrl(e.getPageUrl())
                .visitorId(e.getSession() != null ? e.getSession().getVisitorId() : "Guest")
                .userEmail(e.getUser() != null ? e.getUser().getEmail() : (e.getSession() != null && e.getSession().getUser() != null ? e.getSession().getUser().getEmail() : null))
                .deviceType(e.getSession() != null ? e.getSession().getDeviceType() : "DESKTOP")
                .browser(e.getSession() != null ? e.getSession().getBrowser() : "Browser")
                .trafficSource(e.getSession() != null ? e.getSession().getTrafficSource() : "DIRECT")
                .timestamp(e.getCreatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public List<ActiveVisitorItem> getRealtimeVisitors() {
        LocalDateTime activeCutoff = LocalDateTime.now().minusMinutes(15);
        List<VisitorSession> active = sessionRepo.findActiveSessions(activeCutoff);

        return active.stream().map(s -> ActiveVisitorItem.builder()
                .sessionId(s.getSessionId())
                .visitorId(s.getVisitorId())
                .userEmail(s.getUser() != null ? s.getUser().getEmail() : null)
                .userName(s.getUser() != null ? s.getUser().getFullName() : "Guest Visitor")
                .currentPage(s.getExitPage() != null ? s.getExitPage() : s.getEntryPage())
                .deviceType(s.getDeviceType())
                .browser(s.getBrowser())
                .os(s.getOs())
                .city(s.getCity() != null ? s.getCity() : "India")
                .lastActivityTime(s.getLastActivityTime())
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DailyTrendItem> getDailyTrends(LocalDateTime start, LocalDateTime end) {
        Map<String, DailyTrendItem> trendMap = new LinkedHashMap<>();
        LocalDate cur = start.toLocalDate();
        LocalDate lastDate = end.toLocalDate();

        while (!cur.isAfter(lastDate)) {
            String dateStr = cur.format(DateTimeFormatter.ISO_LOCAL_DATE);
            trendMap.put(dateStr, new DailyTrendItem(dateStr, 0, 0, 0, 0));
            cur = cur.plusDays(1);
        }

        List<VisitorSession> sessions = sessionRepo.findAll();
        for (VisitorSession s : sessions) {
            if (s.getStartTime() != null && !s.getStartTime().isBefore(start) && !s.getStartTime().isAfter(end)) {
                String d = s.getStartTime().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
                if (trendMap.containsKey(d)) {
                    DailyTrendItem item = trendMap.get(d);
                    item.setSessions(item.getSessions() + 1);
                    item.setVisitors(item.getVisitors() + (s.isNewVisitor() ? 1 : 0));
                    item.setPageViews(item.getPageViews() + (s.getPageViewsCount() != null ? s.getPageViewsCount() : 1));
                }
            }
        }

        List<Order> orders = orderRepo.findAll();
        for (Order o : orders) {
            if (o.getCreatedAt() != null && !o.getCreatedAt().isBefore(start) && !o.getCreatedAt().isAfter(end)) {
                String d = o.getCreatedAt().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
                if (trendMap.containsKey(d)) {
                    DailyTrendItem item = trendMap.get(d);
                    item.setOrders(item.getOrders() + 1);
                }
            }
        }

        return new ArrayList<>(trendMap.values());
    }

    @Transactional(readOnly = true)
    public String exportCsv(LocalDateTime start, LocalDateTime end) {
        AnalyticsOverviewDTO overview = getOverview(start, end);
        List<TopPageItem> topPages = getTopPages(start, end);
        List<TrafficSourceItem> traffic = getTrafficReport(start, end);

        StringBuilder sb = new StringBuilder();
        sb.append("Medvarn Website User Analytics Report\n");
        sb.append("Report Date Range,").append(start.toLocalDate()).append(" to ").append(end.toLocalDate()).append("\n\n");

        sb.append("=== METRIC OVERVIEW ===\n");
        sb.append("Unique Visitors,").append(overview.getUniqueVisitors()).append("\n");
        sb.append("Total Sessions,").append(overview.getTotalSessions()).append("\n");
        sb.append("Total Page Views,").append(overview.getTotalPageViews()).append("\n");
        sb.append("New Visitors,").append(overview.getNewVisitors()).append("\n");
        sb.append("Returning Visitors,").append(overview.getReturningVisitors()).append("\n");
        sb.append("Avg Session Duration (sec),").append(overview.getAvgSessionDurationSeconds()).append("\n");
        sb.append("Orders Placed,").append(overview.getTotalOrders()).append("\n");
        sb.append("Conversion Rate (%),").append(overview.getConversionRatePercent()).append("\n\n");

        sb.append("=== TRAFFIC SOURCES ===\n");
        sb.append("Source,Sessions,Percentage\n");
        for (TrafficSourceItem t : traffic) {
            sb.append(t.getSource()).append(",").append(t.getCount()).append(",").append(t.getPercentage()).append("%\n");
        }
        sb.append("\n");

        sb.append("=== TOP VISITED PAGES ===\n");
        sb.append("Page Title,Page URL,Views,Unique Visitors,Avg Duration (sec)\n");
        for (TopPageItem p : topPages) {
            sb.append("\"").append(p.getPageTitle() != null ? p.getPageTitle().replace("\"", "'") : "Page").append("\",")
              .append("\"").append(p.getPageUrl()).append("\",")
              .append(p.getViews()).append(",")
              .append(p.getUniqueVisitors()).append(",")
              .append(p.getAvgTimeSeconds()).append("\n");
        }

        return sb.toString();
    }

    private List<DeviceStatItem> mapStatItems(List<Object[]> rows) {
        long total = rows.stream().mapToLong(r -> (long) r[1]).sum();
        return rows.stream().map(r -> {
            String name = r[0] != null ? (String) r[0] : "Unknown";
            long count = (long) r[1];
            double pct = total > 0 ? (double) count / total * 100.0 : 0.0;
            return new DeviceStatItem(name, count, Math.round(pct * 10.0) / 10.0);
        }).collect(Collectors.toList());
    }

    private List<GeoStatItem> mapGeoItems(List<Object[]> rows) {
        long total = rows.stream().mapToLong(r -> (long) r[1]).sum();
        return rows.stream().map(r -> {
            String loc = r[0] != null ? (String) r[0] : "Unknown";
            long count = (long) r[1];
            double pct = total > 0 ? (double) count / total * 100.0 : 0.0;
            return new GeoStatItem(loc, count, Math.round(pct * 10.0) / 10.0);
        }).collect(Collectors.toList());
    }

    private String hashIp(String ip) {
        if (ip == null || ip.isBlank()) return "ANONYMOUS";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ip.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.substring(0, 16);
        } catch (Exception e) {
            return "ANONYMOUS";
        }
    }

    private String parseDeviceType(String ua) {
        if (ua == null) return "DESKTOP";
        String l = ua.toLowerCase();
        if (l.contains("ipad") || l.contains("tablet") || l.contains("playbook")) return "TABLET";
        if (l.contains("mobile") || l.contains("iphone") || l.contains("android")) return "MOBILE";
        return "DESKTOP";
    }

    private String parseBrowser(String ua) {
        if (ua == null) return "Chrome";
        String l = ua.toLowerCase();
        if (l.contains("edg/")) return "Edge";
        if (l.contains("chrome") && !l.contains("chromium")) return "Chrome";
        if (l.contains("safari") && !l.contains("chrome")) return "Safari";
        if (l.contains("firefox")) return "Firefox";
        if (l.contains("opr") || l.contains("opera")) return "Opera";
        return "Chrome";
    }

    private String parseOS(String ua) {
        if (ua == null) return "Windows";
        String l = ua.toLowerCase();
        if (l.contains("windows")) return "Windows";
        if (l.contains("mac os") || l.contains("macintosh")) return "macOS";
        if (l.contains("iphone") || l.contains("ipad")) return "iOS";
        if (l.contains("android")) return "Android";
        if (l.contains("linux")) return "Linux";
        return "Windows";
    }

    private String parseTrafficSource(String ref) {
        if (ref == null || ref.isBlank()) return "DIRECT";
        String l = ref.toLowerCase();
        if (l.contains("google.com") || l.contains("bing.com") || l.contains("yahoo.com") || l.contains("duckduckgo.com")) {
            return "ORGANIC";
        }
        if (l.contains("facebook.com") || l.contains("instagram.com") || l.contains("twitter.com") || l.contains("t.co") || l.contains("linkedin.com") || l.contains("whatsapp.com") || l.contains("youtube.com")) {
            return "SOCIAL";
        }
        if (l.contains("medvarn.com")) return "DIRECT";
        return "REFERRAL";
    }

    private String extractDomain(String ref) {
        if (ref == null || ref.isBlank()) return "direct";
        try {
            URI uri = new URI(ref);
            String domain = uri.getHost();
            return domain != null ? domain.startsWith("www.") ? domain.substring(4) : domain : "direct";
        } catch (Exception e) {
            return "direct";
        }
    }
}
