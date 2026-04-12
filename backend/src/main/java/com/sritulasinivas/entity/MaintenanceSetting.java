package com.sritulasinivas.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "maintenance_settings", uniqueConstraints = @UniqueConstraint(columnNames = {"month", "year"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceSetting {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String month;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private BigDecimal amount;

    private String decidedBy;
    private LocalDate decidedDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
