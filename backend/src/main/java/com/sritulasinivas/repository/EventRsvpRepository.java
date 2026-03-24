package com.sritulasinivas.repository;

import com.sritulasinivas.entity.EventRsvp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRsvpRepository extends JpaRepository<EventRsvp, Long> {
    Optional<EventRsvp> findByEventIdAndUserId(Long eventId, Long userId);
    List<EventRsvp> findByEventId(Long eventId);
}
