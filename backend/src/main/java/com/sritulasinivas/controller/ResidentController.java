package com.sritulasinivas.controller;

import com.sritulasinivas.entity.User;
import com.sritulasinivas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/residents")

public class ResidentController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<User> getAll(Principal principal) {
        List<User> all = userRepository.findAll();
        if (principal != null) {
            User requester = userRepository.findByEmail(principal.getName()).orElse(null);
            if (requester != null && requester.getRole() == User.UserRole.ADMIN) {
                return all;
            }
        }
        return all.stream()
            .filter(u -> u.getRole() != User.UserRole.ADMIN)
            .collect(Collectors.toList());
    }

    @GetMapping("/phones")
    public ResponseEntity<List<Map<String, String>>> getPhones() {
        List<Map<String, String>> phones = userRepository.findAllByIsActiveTrue().stream()
            .filter(u -> u.getPhone() != null && !u.getPhone().isBlank())
            .map(u -> {
                Map<String, String> m = new LinkedHashMap<>();
                m.put("name", u.getFirstName() + " " + u.getLastName());
                m.put("phone", u.getPhone());
                m.put("flatNo", u.getFlatNo() != null ? u.getFlatNo() : "");
                return m;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(phones);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody Map<String, Object> body,
                                    Principal principal) {
        return userRepository.findById(id).map(user -> {
            if (body.containsKey("firstName")) user.setFirstName((String) body.get("firstName"));
            if (body.containsKey("lastName"))  user.setLastName((String) body.get("lastName"));
            if (body.containsKey("flatNo"))    user.setFlatNo((String) body.get("flatNo"));
            if (body.containsKey("phone"))     user.setPhone((String) body.get("phone"));
            if (body.containsKey("role")) {
                try { user.setRole(User.UserRole.valueOf((String) body.get("role"))); } catch (Exception ignored) {}
            }
            if (body.containsKey("isActive"))       user.setIsActive((Boolean) body.get("isActive"));
            if (body.containsKey("whatsappApiKey"))  user.setWhatsappApiKey((String) body.get("whatsappApiKey"));
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Principal principal) {
        User requester = userRepository.findByEmail(principal.getName()).orElse(null);
        if (requester == null || requester.getRole() != User.UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only ADMIN can delete users"));
        }
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}

