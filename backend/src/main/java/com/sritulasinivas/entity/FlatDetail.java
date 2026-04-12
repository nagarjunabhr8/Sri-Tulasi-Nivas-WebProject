package com.sritulasinivas.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "flat_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlatDetail {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String flatNo;

    @Column(nullable = false)
    private String ownerName;

    private String ownerPhone;
    private String ownerEmail;

    private String occupantType = "Owner"; // Owner, Tenant, Vacant

    private String tenantName;
    private String tenantPhone;
    private String tenantEmail;

    private Boolean isOccupied = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
