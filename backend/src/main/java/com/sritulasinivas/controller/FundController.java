package com.sritulasinivas.controller;

import com.sritulasinivas.entity.Fund;
import com.sritulasinivas.repository.FundRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/funds")

public class FundController {

    @Autowired
    private FundRepository fundRepository;

    @GetMapping
    public List<Fund> getAll() {
        return fundRepository.findAllByOrderByDateDesc();
    }

    @PostMapping
    public ResponseEntity<Fund> create(@RequestBody Fund fund) {
        return new ResponseEntity<>(fundRepository.save(fund), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fund> update(@PathVariable UUID id, @RequestBody Fund fund) {
        if (!fundRepository.existsById(id)) return ResponseEntity.notFound().build();
        fund.setId(id);
        return ResponseEntity.ok(fundRepository.save(fund));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!fundRepository.existsById(id)) return ResponseEntity.notFound().build();
        fundRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
