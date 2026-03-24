package com.sritulasinivas.service;

import com.sritulasinivas.dto.EventDTO;
import com.sritulasinivas.entity.Event;
import com.sritulasinivas.entity.EventContribution;
import com.sritulasinivas.entity.EventRsvp;
import com.sritulasinivas.entity.User;
import com.sritulasinivas.repository.EventContributionRepository;
import com.sritulasinivas.repository.EventRepository;
import com.sritulasinivas.repository.EventRsvpRepository;
import com.sritulasinivas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventContributionRepository contributionRepository;

    @Autowired
    private EventRsvpRepository eventRsvpRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<EventDTO> getUpcomingEvents(Pageable pageable, Long currentUserId) {
        return eventRepository.findByEventDateAfter(LocalDateTime.now(), pageable)
            .map(event -> mapToDTO(event, currentUserId));
    }

    @Transactional(readOnly = true)
    public EventDTO getEventById(Long eventId, Long currentUserId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        return mapToDTO(event, currentUserId);
    }

    @Transactional
    public EventDTO createEvent(EventDTO dto, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setLocation(dto.getLocation());
        event.setEstimatedBudget(dto.getEstimatedBudget() != null ? dto.getEstimatedBudget() : BigDecimal.ZERO);
        event.setStatus(Event.EventStatus.PLANNED);
        event.setFestivalLink(dto.getFestivalLink());
        event.setInitiatedBy(
            (dto.getInitiatedBy() != null && !dto.getInitiatedBy().isBlank())
                ? dto.getInitiatedBy()
                : creator.getFirstName() + " " + creator.getLastName()
        );

        Event saved = eventRepository.save(event);
        return mapToDTO(saved, creator.getId());
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
        event.setFestivalLink(dto.getFestivalLink());
        event.setInitiatedBy(dto.getInitiatedBy());

        Event updated = eventRepository.save(event);
        return mapToDTO(updated, null);
    }

    @Transactional
    public EventDTO submitRsvp(Long eventId, String userEmail, String rsvpStatus) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        EventRsvp rsvp = eventRsvpRepository.findByEventIdAndUserId(eventId, user.getId())
            .orElse(new EventRsvp());
        rsvp.setEvent(event);
        rsvp.setUser(user);
        rsvp.setRsvpStatus(EventRsvp.RsvpStatus.valueOf(rsvpStatus));
        eventRsvpRepository.save(rsvp);

        return mapToDTO(event, user.getId());
    }

    private EventDTO mapToDTO(Event event, Long currentUserId) {
        List<EventContribution> contributions = contributionRepository.findByEventId(event.getId());
        BigDecimal totalContributed = contributions.stream()
            .map(EventContribution::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<EventRsvp> rsvps = eventRsvpRepository.findByEventId(event.getId());
        Map<String, Long> rsvpCounts = new HashMap<>();
        for (EventRsvp.RsvpStatus s : EventRsvp.RsvpStatus.values()) {
            rsvpCounts.put(s.name(), rsvps.stream().filter(r -> r.getRsvpStatus() == s).count());
        }

        String userRsvp = null;
        if (currentUserId != null) {
            userRsvp = rsvps.stream()
                .filter(r -> r.getUser().getId().equals(currentUserId))
                .map(r -> r.getRsvpStatus().name())
                .findFirst().orElse(null);
        }

        return new EventDTO(
            event.getId(),
            event.getTitle(),
            event.getDescription(),
            event.getEventDate(),
            event.getLocation(),
            event.getEstimatedBudget(),
            event.getStatus() != null ? event.getStatus().toString() : "PLANNED",
            contributions.size(),
            totalContributed,
            event.getFestivalLink(),
            event.getInitiatedBy(),
            rsvpCounts,
            userRsvp
        );
    }
}

