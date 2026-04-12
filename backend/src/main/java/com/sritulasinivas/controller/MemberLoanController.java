package com.sritulasinivas.controller;

import com.sritulasinivas.entity.LoanRepayment;
import com.sritulasinivas.entity.MemberLoan;
import com.sritulasinivas.repository.LoanRepaymentRepository;
import com.sritulasinivas.repository.MemberLoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/loans")
public class MemberLoanController {

    @Autowired
    private MemberLoanRepository loanRepo;

    @Autowired
    private LoanRepaymentRepository repaymentRepo;

    @GetMapping
    public List<MemberLoan> getAll() {
        return loanRepo.findAllByOrderByStartDateDesc();
    }

    @GetMapping("/active")
    public List<MemberLoan> getActive() {
        return loanRepo.findByStatus("Active");
    }

    @PostMapping
    public ResponseEntity<MemberLoan> create(@RequestBody MemberLoan loan) {
        loan.setOutstandingPrincipal(loan.getPrincipalAmount());
        loan.setTotalPrincipalPaid(BigDecimal.ZERO);
        loan.setTotalInterestPaid(BigDecimal.ZERO);
        loan.setStatus("Active");
        if (loan.getExpectedReturnDate() == null) {
            loan.setExpectedReturnDate(loan.getStartDate().plusMonths(loan.getDurationMonths()));
        }
        return new ResponseEntity<>(loanRepo.save(loan), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberLoan> update(@PathVariable UUID id, @RequestBody MemberLoan loan) {
        if (!loanRepo.existsById(id)) return ResponseEntity.notFound().build();
        loan.setId(id);
        return ResponseEntity.ok(loanRepo.save(loan));
    }

    // ── Repayments ────────────────────────────────────────

    @GetMapping("/{loanId}/repayments")
    public List<LoanRepayment> getRepayments(@PathVariable UUID loanId) {
        return repaymentRepo.findByLoanIdOrderByRepaymentDateDesc(loanId);
    }

    @PostMapping("/{loanId}/repayments")
    public ResponseEntity<?> addRepayment(@PathVariable UUID loanId, @RequestBody LoanRepayment repayment) {
        Optional<MemberLoan> opt = loanRepo.findById(loanId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        MemberLoan loan = opt.get();
        if ("Closed".equals(loan.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Loan is already closed"));
        }

        repayment.setLoanId(loanId);

        BigDecimal newPrincipalPaid = loan.getTotalPrincipalPaid().add(repayment.getPrincipalPortion());
        BigDecimal newInterestPaid = loan.getTotalInterestPaid().add(repayment.getInterestPortion());
        BigDecimal newOutstanding = loan.getOutstandingPrincipal().subtract(repayment.getPrincipalPortion());

        if (newOutstanding.compareTo(BigDecimal.ZERO) <= 0) {
            newOutstanding = BigDecimal.ZERO;
            loan.setStatus("Closed");
        }

        repayment.setOutstandingAfter(newOutstanding);
        repaymentRepo.save(repayment);

        loan.setOutstandingPrincipal(newOutstanding);
        loan.setTotalPrincipalPaid(newPrincipalPaid);
        loan.setTotalInterestPaid(newInterestPaid);
        loanRepo.save(loan);

        return new ResponseEntity<>(repayment, HttpStatus.CREATED);
    }

    // ── Interest calculator ───────────────────────────────

    @GetMapping("/{loanId}/interest-due")
    public ResponseEntity<?> calculateInterestDue(@PathVariable UUID loanId) {
        Optional<MemberLoan> opt = loanRepo.findById(loanId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        MemberLoan loan = opt.get();
        List<LoanRepayment> repayments = repaymentRepo.findByLoanIdOrderByRepaymentDateAsc(loanId);

        LocalDate lastPaymentDate = repayments.isEmpty()
                ? loan.getStartDate()
                : repayments.get(repayments.size() - 1).getRepaymentDate();

        long days = ChronoUnit.DAYS.between(lastPaymentDate, LocalDate.now());
        if (days < 0) days = 0;

        // Simple interest: P × R × D / (365 × 100)
        BigDecimal dailyRate = loan.getInterestRate()
                .divide(BigDecimal.valueOf(36500), 10, RoundingMode.HALF_UP);
        BigDecimal interestDue = loan.getOutstandingPrincipal()
                .multiply(dailyRate)
                .multiply(BigDecimal.valueOf(days))
                .setScale(2, RoundingMode.HALF_UP);

        return ResponseEntity.ok(Map.of(
                "outstandingPrincipal", loan.getOutstandingPrincipal(),
                "interestRate", loan.getInterestRate(),
                "daysSinceLastPayment", days,
                "interestDue", interestDue,
                "lastPaymentDate", lastPaymentDate.toString()
        ));
    }
}
