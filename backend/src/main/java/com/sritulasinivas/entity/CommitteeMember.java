package com.sritulasinivas.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "committee_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommitteeMember {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String role; // President, Vice President, Treasurer, Secretary, Joint Secretary, Committee Member, Ex-President

    @Column(nullable = false)
    private String name;

    private String flatNo;
    private String phone;
    private String email;

    @Column(nullable = false)
    private LocalDate termStart;

    @Column(nullable = false)
    private LocalDate termEnd;

    private String termDuration; // 3 Months, 6 Months, 1 Year, 2 Years, 3 Years, 5 Years

    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
