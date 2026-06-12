package com.medvastr.backend.service;

import com.medvastr.backend.dto.DashboardDTO;
import com.medvastr.backend.dto.OrderDTO;
import com.medvastr.backend.model.Order;
import com.medvastr.backend.repository.OrderRepository;
import com.medvastr.backend.repository.ProductRepository;
import com.medvastr.backend.repository.UserRepository;
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
            .totalRevenue(Optional.ofNullable(orderRepo.totalRevenue(Order.PaymentStatus.PAID)).orElse(BigDecimal.ZERO))
            .revenueToday(Optional.ofNullable(orderRepo.todayRevenue(Order.PaymentStatus.PAID)).orElse(BigDecimal.ZERO))
            .totalOrders(orderRepo.count())
            .ordersToday(Optional.ofNullable(orderRepo.todayOrders()).orElse(0L))
            .totalCustomers(userRepo.countByActiveTrue())
            .totalProducts(productRepo.countByActiveTrue())
            .recentOrders(recent)
            .build();
    }
}

