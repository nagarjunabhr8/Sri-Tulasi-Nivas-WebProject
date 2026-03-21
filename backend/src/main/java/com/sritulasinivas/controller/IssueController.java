package com.sritulasinivas.controller;

import com.sritulasinivas.entity.Issue;
import com.sritulasinivas.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/issues")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!issueRepository.existsById(id)) return ResponseEntity.notFound().build();
        issueRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
