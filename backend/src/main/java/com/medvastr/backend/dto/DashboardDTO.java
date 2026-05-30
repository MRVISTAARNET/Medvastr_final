package com.medvastr.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private BigDecimal totalRevenue;
    private BigDecimal revenueToday;
    private Long totalOrders;
    private Long ordersToday;
    private Long totalCustomers;
    private Long totalProducts;
    private List<OrderDTO> recentOrders;
    private List<ProductDTO> topProducts;
}

