package com.sritulasinivas.repository;

import com.sritulasinivas.entity.LoanRepayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, UUID> {
    List<LoanRepayment> findByLoanIdOrderByRepaymentDateDesc(UUID loanId);
    List<LoanRepayment> findByLoanIdOrderByRepaymentDateAsc(UUID loanId);
}
