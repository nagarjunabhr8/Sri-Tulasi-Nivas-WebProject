package com.sritulasinivas.controller;

import com.sritulasinivas.entity.Meeting;
import com.sritulasinivas.repository.MeetingRepository;
import com.sritulasinivas.service.MeetingReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/meetings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class MeetingController {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private MeetingReminderService meetingReminderService;

    @GetMapping
    public List<Meeting> getAll() {
        return meetingRepository.findAllByOrderByDateDesc();
    }

    @PostMapping
    public ResponseEntity<Meeting> create(@RequestBody Meeting meeting) {
        Meeting saved = meetingRepository.save(meeting);
        if (saved.isImmediateNotify()) {
            meetingReminderService.sendImmediateNotification(saved);
        }
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Meeting> update(@PathVariable UUID id, @RequestBody Meeting meeting) {
        if (!meetingRepository.existsById(id)) return ResponseEntity.notFound().build();
        meeting.setId(id);
        return ResponseEntity.ok(meetingRepository.save(meeting));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!meetingRepository.existsById(id)) return ResponseEntity.notFound().build();
        meetingRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

