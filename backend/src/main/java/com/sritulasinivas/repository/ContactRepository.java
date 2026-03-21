package com.sritulasinivas.repository;

import com.sritulasinivas.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContactRepository extends JpaRepository<Contact, UUID> {
    List<Contact> findByIsActiveTrueOrderByRoleAscNameAsc();
}
