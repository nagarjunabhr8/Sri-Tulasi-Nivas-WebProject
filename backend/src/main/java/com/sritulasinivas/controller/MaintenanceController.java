package com.sritulasinivas.controller;

import com.sritulasinivas.entity.Maintenance;
import com.sritulasinivas.repository.MaintenanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/maintenance")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class MaintenanceController {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @GetMapping
    public List<Maintenance> getAll() {
        return maintenanceRepository.findAllOrdered();
    }

    @GetMapping("/flat/{flatNo}")
    public List<Maintenance> getByFlat(@PathVariable String flatNo) {
        return maintenanceRepository.findByFlatNoOrderByYearDescMonthDesc(flatNo);
    }

    @PostMapping
    public ResponseEntity<Maintenance> create(@RequestBody Maintenance maintenance) {
        return new ResponseEntity<>(maintenanceRepository.save(maintenance), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Maintenance> update(@PathVariable UUID id, @RequestBody Maintenance maintenance) {
        if (!maintenanceRepository.existsById(id)) return ResponseEntity.notFound().build();
        maintenance.setId(id);
        return ResponseEntity.ok(maintenanceRepository.save(maintenance));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!maintenanceRepository.existsById(id)) return ResponseEntity.notFound().build();
        maintenanceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
