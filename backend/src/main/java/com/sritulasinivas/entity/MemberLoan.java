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
@Table(name = "member_loans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberLoan {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String memberName;

    @Column(nullable = false)
    private String flatNo;

    @Column(nullable = false)
    private BigDecimal principalAmount;

    @Column(nullable = false)
    private BigDecimal interestRate; // annual percentage

    @Column(nullable = false)
    private int durationMonths;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate expectedReturnDate;

    @Column(nullable = false)
    private BigDecimal outstandingPrincipal;

    private BigDecimal totalPrincipalPaid = BigDecimal.ZERO;
    private BigDecimal totalInterestPaid = BigDecimal.ZERO;

    private String status = "Active"; // Active, Closed

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
