package com.sritulasinivas.repository;

import com.sritulasinivas.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MeetingRepository extends JpaRepository<Meeting, UUID> {
    List<Meeting> findAllByOrderByDateDesc();
    List<Meeting> findByReminderSentFalseAndStatusNot(String status);
}
