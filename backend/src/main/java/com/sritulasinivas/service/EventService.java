package com.sritulasinivas.service;

import com.sritulasinivas.dto.EventDTO;
import com.sritulasinivas.entity.Event;
import com.sritulasinivas.entity.EventContribution;
import com.sritulasinivas.repository.EventRepository;
import com.sritulasinivas.repository.EventContributionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventContributionRepository contributionRepository;

    @Transactional(readOnly = true)
    public Page<EventDTO> getUpcomingEvents(Pageable pageable) {
        return eventRepository.findByEventDateAfter(LocalDateTime.now(), pageable)
            .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public EventDTO getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        return mapToDTO(event);
    }

    @Transactional
    public EventDTO createEvent(EventDTO dto) {
        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setLocation(dto.getLocation());
        event.setEstimatedBudget(dto.getEstimatedBudget());
        event.setStatus(Event.EventStatus.PLANNED);

        Event saved = eventRepository.save(event);
        return mapToDTO(saved);
    }

    @Transactional
    public EventDTO updateEvent(Long eventId, EventDTO dto) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setLocation(dto.getLocation());
        event.setEstimatedBudget(dto.getEstimatedBudget());
        event.setStatus(Event.EventStatus.valueOf(dto.getStatus()));

        Event updated = eventRepository.save(event);
        return mapToDTO(updated);
    }

    private EventDTO mapToDTO(Event event) {
        List<EventContribution> contributions = contributionRepository.findByEventId(event.getId());
        BigDecimal totalContributed = contributions.stream()
            .map(EventContribution::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new EventDTO(
            event.getId(),
            event.getTitle(),
            event.getDescription(),
            event.getEventDate(),
            event.getLocation(),
            event.getEstimatedBudget(),
            event.getStatus().toString(),
            contributions.size(),
            totalContributed
        );
    }
}
