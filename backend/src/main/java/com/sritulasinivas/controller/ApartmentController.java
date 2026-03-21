package com.sritulasinivas.controller;

import com.sritulasinivas.dto.ApartmentDTO;
import com.sritulasinivas.service.ApartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/apartments")
@CrossOrigin(origins = {"http://localhost:3000", "https://qualitycrafted.live"})
public class ApartmentController {

    @Autowired
    private ApartmentService apartmentService;

    @GetMapping("/public")
    public ResponseEntity<Page<ApartmentDTO>> getAvailableApartments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(apartmentService.getAvailableApartments(pageable));
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<ApartmentDTO>> getOwnerApartments(@PathVariable Long ownerId) {
        return ResponseEntity.ok(apartmentService.getOwnerApartments(ownerId));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<ApartmentDTO> createApartment(
            @RequestBody ApartmentDTO dto,
            @RequestParam Long ownerId) {
        ApartmentDTO created = apartmentService.createApartment(dto, ownerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<ApartmentDTO> updateApartment(
            @PathVariable Long id,
            @RequestBody ApartmentDTO dto) {
        ApartmentDTO updated = apartmentService.updateApartment(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteApartment(@PathVariable Long id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.noContent().build();
    }
}
