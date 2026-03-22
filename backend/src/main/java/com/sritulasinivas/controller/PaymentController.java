package com.sritulasinivas.controller;

import com.sritulasinivas.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payments")

public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-intent")
    @PreAuthorize("hasRole('TENANT') or hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> createPaymentIntent(
            @RequestParam Long userId,
            @RequestParam Long eventId,
            @RequestParam BigDecimal amount) {
        try {
            String clientSecret = paymentService.createPaymentIntent(userId, eventId, amount);
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", clientSecret);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/confirm")
    @PreAuthorize("hasRole('TENANT') or hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> confirmPayment(
            @RequestParam String paymentIntentId) {
        try {
            paymentService.confirmPayment(paymentIntentId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Payment confirmed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
