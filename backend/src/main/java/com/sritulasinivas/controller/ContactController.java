package com.sritulasinivas.controller;

import com.sritulasinivas.entity.Contact;
import com.sritulasinivas.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contacts")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class ContactController {

    @Autowired
    private ContactRepository contactRepository;

    @GetMapping
    public List<Contact> getAll() {
        return contactRepository.findByIsActiveTrueOrderByRoleAscNameAsc();
    }

    @GetMapping("/all")
    public List<Contact> getAllIncludingInactive() {
        return contactRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Contact> create(@RequestBody Contact contact) {
        return new ResponseEntity<>(contactRepository.save(contact), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> update(@PathVariable UUID id, @RequestBody Contact contact) {
        if (!contactRepository.existsById(id)) return ResponseEntity.notFound().build();
        contact.setId(id);
        return ResponseEntity.ok(contactRepository.save(contact));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!contactRepository.existsById(id)) return ResponseEntity.notFound().build();
        contactRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
