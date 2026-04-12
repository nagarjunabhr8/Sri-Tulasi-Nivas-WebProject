package com.sritulasinivas.controller;

import com.sritulasinivas.entity.CommitteeMember;
import com.sritulasinivas.repository.CommitteeMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/committee")
public class CommitteeController {

    private static final Set<String> TERM_LIMITED_ROLES = Set.of(
        "President", "Vice President"
    );
    private static final int MAX_TERM_YEARS = 5;

    @Autowired
    private CommitteeMemberRepository repository;

    @GetMapping
    public List<CommitteeMember> getAll() {
        return repository.findAllByOrderByRoleAscTermStartDesc();
    }

    @GetMapping("/active")
    public List<CommitteeMember> getActive() {
        return repository.findByIsActiveTrueOrderByRoleAscNameAsc();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CommitteeMember member) {
        // Validate term duration for President/VP (max 5 years)
        if (TERM_LIMITED_ROLES.contains(member.getRole())) {
            if (member.getTermStart() != null && member.getTermEnd() != null) {
                Period period = Period.between(member.getTermStart(), member.getTermEnd());
                int totalMonths = period.getYears() * 12 + period.getMonths();
                if (totalMonths > MAX_TERM_YEARS * 12) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", member.getRole() + " term cannot exceed " + MAX_TERM_YEARS + " years"));
                }
            }
        }
        return new ResponseEntity<>(repository.save(member), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody CommitteeMember member) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();

        // Validate term duration for President/VP (max 5 years)
        if (TERM_LIMITED_ROLES.contains(member.getRole())) {
            if (member.getTermStart() != null && member.getTermEnd() != null) {
                Period period = Period.between(member.getTermStart(), member.getTermEnd());
                int totalMonths = period.getYears() * 12 + period.getMonths();
                if (totalMonths > MAX_TERM_YEARS * 12) {
                    return ResponseEntity.badRequest().body(
                        Map.of("error", member.getRole() + " term cannot exceed " + MAX_TERM_YEARS + " years"));
                }
            }
        }

        member.setId(id);
        return ResponseEntity.ok(repository.save(member));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
