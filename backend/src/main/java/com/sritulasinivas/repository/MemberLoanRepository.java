package com.sritulasinivas.repository;

import com.sritulasinivas.entity.MemberLoan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MemberLoanRepository extends JpaRepository<MemberLoan, UUID> {
    List<MemberLoan> findAllByOrderByStartDateDesc();
    List<MemberLoan> findByStatus(String status);
}
