package com.sritulasinivas.repository;

import com.sritulasinivas.entity.CommitteeMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommitteeMemberRepository extends JpaRepository<CommitteeMember, UUID> {
    List<CommitteeMember> findByIsActiveTrueOrderByRoleAscNameAsc();
    List<CommitteeMember> findAllByOrderByRoleAscTermStartDesc();
    List<CommitteeMember> findByRoleAndIsActiveTrue(String role);
}
