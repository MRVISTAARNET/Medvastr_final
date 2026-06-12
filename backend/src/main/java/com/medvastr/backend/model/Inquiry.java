package com.medvastr.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String type;
    @Column(columnDefinition = "LONGTEXT")
    private String message;
    @Builder.Default
    private String status = "NEW";
    private String subject;
    private LocalDateTime repliedAt;
    @CreationTimestamp
    private LocalDateTime createdAt;
}
