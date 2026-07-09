package com.medvastr.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "order_feedbacks",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"order_number"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 30)
    private String orderNumber;

    @Column(nullable = false)
    private Integer rating; // 0 to 10

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private String customerName;
    private String customerEmail;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
