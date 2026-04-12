package com.sritulasinivas.controller;

import com.sritulasinivas.entity.FlatDetail;
import com.sritulasinivas.repository.FlatDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/flat-details")
public class FlatDetailController {

    @Autowired
    private FlatDetailRepository repo;

    @GetMapping
    public List<FlatDetail> getAll() {
        return repo.findAllByOrderByFlatNoAsc();
    }

    @GetMapping("/flat/{flatNo}")
    public ResponseEntity<FlatDetail> getByFlatNo(@PathVariable String flatNo) {
        return repo.findByFlatNo(flatNo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FlatDetail f) {
        if (repo.findByFlatNo(f.getFlatNo()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error",
                    "Flat " + f.getFlatNo() + " already exists. Use update instead."));
        }
        return new ResponseEntity<>(repo.save(f), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlatDetail> update(@PathVariable UUID id, @RequestBody FlatDetail f) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        f.setId(id);
        return ResponseEntity.ok(repo.save(f));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
