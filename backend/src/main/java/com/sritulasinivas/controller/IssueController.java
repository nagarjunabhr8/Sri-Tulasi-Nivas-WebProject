package com.sritulasinivas.controller;

import com.sritulasinivas.entity.Issue;
import com.sritulasinivas.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/issues")

public class IssueController {

    @Autowired
    private IssueRepository issueRepository;

    @GetMapping
    public List<Issue> getAll() {
        return issueRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/flat/{flatNo}")
    public List<Issue> getByFlat(@PathVariable String flatNo) {
        return issueRepository.findByFlatNoOrderByCreatedAtDesc(flatNo);
    }

    @PostMapping
    public ResponseEntity<Issue> create(@RequestBody Issue issue) {
        return new ResponseEntity<>(issueRepository.save(issue), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Issue> update(@PathVariable UUID id, @RequestBody Issue issue) {
        if (!issueRepository.existsById(id)) return ResponseEntity.notFound().build();
        issue.setId(id);
        return ResponseEntity.ok(issueRepository.save(issue));
    }

    private static final Map<String, Set<String>> VALID_TRANSITIONS = Map.of(
        "Open", Set.of("In Progress"),
        "In Progress", Set.of("Resolved", "Open"),
        "Resolved", Set.of("Closed", "In Progress"),
        "Closed", Set.of("Open")
    );

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return issueRepository.findById(id).map(existing -> {
            String newStatus = body.get("status");
            String currentStatus = existing.getStatus();

            if (newStatus == null || !VALID_TRANSITIONS.containsKey(currentStatus)
                    || !VALID_TRANSITIONS.get(currentStatus).contains(newStatus)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid status transition from '" + currentStatus + "' to '" + newStatus + "'"));
            }

            if ("In Progress".equals(newStatus)) {
                String assignedTo = body.get("assignedTo");
                if (assignedTo == null || assignedTo.isBlank()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "assignedTo is required when moving to In Progress"));
                }
                existing.setAssignedTo(assignedTo);
            }

            if ("Resolved".equals(newStatus)) {
                existing.setResolvedAt(LocalDateTime.now());
                String notes = body.get("resolutionNotes");
                if (notes != null && !notes.isBlank()) {
                    existing.setResolutionNotes(notes);
                }
            }

            if ("Open".equals(newStatus)) {
                existing.setAssignedTo(null);
                existing.setResolvedAt(null);
                existing.setResolutionNotes(null);
            }

            existing.setStatus(newStatus);
            return ResponseEntity.ok(issueRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!issueRepository.existsById(id)) return ResponseEntity.notFound().build();
        issueRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
