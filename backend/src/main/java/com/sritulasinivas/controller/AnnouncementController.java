package com.sritulasinivas.controller;

import com.sritulasinivas.entity.Announcement;
import com.sritulasinivas.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/announcements")

public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @GetMapping
    public List<Announcement> getAll() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<Announcement> create(@RequestBody Announcement announcement) {
        return new ResponseEntity<>(announcementRepository.save(announcement), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Announcement> update(@PathVariable UUID id, @RequestBody Announcement announcement) {
        if (!announcementRepository.existsById(id)) return ResponseEntity.notFound().build();
        announcement.setId(id);
        return ResponseEntity.ok(announcementRepository.save(announcement));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!announcementRepository.existsById(id)) return ResponseEntity.notFound().build();
        announcementRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
