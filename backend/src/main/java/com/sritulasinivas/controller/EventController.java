package com.sritulasinivas.controller;

import com.sritulasinivas.dto.EventDTO;
import com.sritulasinivas.entity.User;
import com.sritulasinivas.repository.UserRepository;
import com.sritulasinivas.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/public/upcoming")
    public ResponseEntity<Page<EventDTO>> getUpcomingEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        Long userId = resolveUserId(principal);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(eventService.getUpcomingEvents(pageable, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id, Principal principal) {
        Long userId = resolveUserId(principal);
        return ResponseEntity.ok(eventService.getEventById(id, userId));
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody EventDTO dto, Principal principal) {
        try {
            EventDTO created = eventService.createEvent(dto, principal.getName());
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("message", e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable Long id,
            @RequestBody EventDTO dto) {
        EventDTO updated = eventService.updateEvent(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/rsvp")
    public ResponseEntity<EventDTO> submitRsvp(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        EventDTO updated = eventService.submitRsvp(id, principal.getName(), body.get("rsvpStatus"));
        return ResponseEntity.ok(updated);
    }

    private Long resolveUserId(Principal principal) {
        if (principal == null) return null;
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        return user != null ? user.getId() : null;
    }
}

