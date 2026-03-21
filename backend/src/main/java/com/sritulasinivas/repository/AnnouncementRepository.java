package com.sritulasinivas.repository;

import com.sritulasinivas.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
    List<Announcement> findByStatusOrderByCreatedAtDesc(String status);
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
