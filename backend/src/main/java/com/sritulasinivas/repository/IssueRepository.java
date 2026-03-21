package com.sritulasinivas.repository;

import com.sritulasinivas.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IssueRepository extends JpaRepository<Issue, UUID> {
    List<Issue> findByFlatNoOrderByCreatedAtDesc(String flatNo);
    List<Issue> findByStatusOrderByCreatedAtDesc(String status);
    List<Issue> findAllByOrderByCreatedAtDesc();
}
