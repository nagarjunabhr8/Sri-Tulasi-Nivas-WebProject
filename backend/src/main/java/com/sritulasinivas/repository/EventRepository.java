package com.sritulasinivas.repository;

import com.sritulasinivas.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findByStatus(Event.EventStatus status, Pageable pageable);
    List<Event> findByEventDateAfter(LocalDateTime date);
    Page<Event> findByEventDateAfter(LocalDateTime date, Pageable pageable);
}
