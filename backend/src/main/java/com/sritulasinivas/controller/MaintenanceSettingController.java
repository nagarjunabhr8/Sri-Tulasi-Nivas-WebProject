package com.sritulasinivas.controller;

import com.sritulasinivas.entity.MaintenanceSetting;
import com.sritulasinivas.repository.MaintenanceSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/maintenance-settings")
public class MaintenanceSettingController {

    @Autowired
    private MaintenanceSettingRepository repo;

    @GetMapping
    public List<MaintenanceSetting> getAll() {
        return repo.findAllByOrderByYearDescCreatedAtDesc();
    }

    @GetMapping("/{month}/{year}")
    public ResponseEntity<MaintenanceSetting> getByMonthYear(@PathVariable String month, @PathVariable int year) {
        return repo.findByMonthAndYear(month, year)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody MaintenanceSetting s) {
        if (repo.findByMonthAndYear(s.getMonth(), s.getYear()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error",
                    "Rate already set for " + s.getMonth() + " " + s.getYear() + ". Use update instead."));
        }
        return new ResponseEntity<>(repo.save(s), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceSetting> update(@PathVariable UUID id, @RequestBody MaintenanceSetting s) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        s.setId(id);
        return ResponseEntity.ok(repo.save(s));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
