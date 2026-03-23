package com.sritulasinivas.service;

import com.sritulasinivas.dto.AuthRequest;
import com.sritulasinivas.dto.AuthResponse;
import com.sritulasinivas.dto.RegisterRequest;
import com.sritulasinivas.entity.User;
import com.sritulasinivas.repository.UserRepository;
import com.sritulasinivas.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setFlatNo(request.getFlatNo());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        String role = (request.getRole() != null && !request.getRole().isEmpty()) ? request.getRole() : "TENANT";
        user.setRole(User.UserRole.valueOf(role.toUpperCase()));
        user.setIsActive(false);          // disabled until email is verified
        user.setEmailVerified(false);
        user.setVerificationToken(verificationToken);
        user.setTokenExpiresAt(LocalDateTime.now().plusHours(24));

        User savedUser = userRepository.save(user);

        emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getFirstName(), verificationToken);

        // Return response without JWT — user must verify email before logging in
        return new AuthResponse(
            null,
            null,
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getFirstName(),
            savedUser.getLastName(),
            savedUser.getRole().toString()
        );
    }

    @Transactional
    public Map<String, String> verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid or expired verification link."));

        if (user.getTokenExpiresAt() != null && LocalDateTime.now().isAfter(user.getTokenExpiresAt())) {
            throw new RuntimeException("Verification link has expired. Please register again.");
        }

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return Map.of("message", "Email already verified. You can now log in.");
        }

        user.setEmailVerified(true);
        user.setIsActive(true);
        user.setVerificationToken(null);
        user.setTokenExpiresAt(null);
        userRepository.save(user);

        return Map.of("message", "Email verified successfully! You can now log in.");
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            String token = tokenProvider.generateToken(authentication);
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().toString()
            );
        } catch (DisabledException e) {
            throw new RuntimeException("Please verify your email address before logging in. Check your inbox for the confirmation email.");
        }
    }
}
