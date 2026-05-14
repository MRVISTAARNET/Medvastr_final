package com.medvastr.service;

import com.medvastr.dto.DashboardDTO;
import com.medvastr.dto.OrderDTO;
import com.medvastr.repository.OrderRepository;
import com.medvastr.repository.ProductRepository;
import com.medvastr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final OrderRepository orderRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;

    public DashboardDTO getDashboard() {
        List<OrderDTO> recent = orderRepo.findRecent(PageRequest.of(0, 10)).stream()
            .map(o -> OrderDTO.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus().name())
                .totalAmount(o.getTotalAmount())
                .createdAt(o.getCreatedAt())
                .build())
            .collect(Collectors.toList());

        return DashboardDTO.builder()
            .totalRevenue(Optional.ofNullable(orderRepo.totalRevenue()).orElse(BigDecimal.ZERO))
            .revenueToday(Optional.ofNullable(orderRepo.todayRevenue()).orElse(BigDecimal.ZERO))
            .totalOrders(orderRepo.count())
            .ordersToday(Optional.ofNullable(orderRepo.todayOrders()).orElse(0L))
            .totalCustomers(userRepo.countByActiveTrue())
            .totalProducts(productRepo.countByActiveTrue())
            .recentOrders(recent)
            .build();
    }
}

