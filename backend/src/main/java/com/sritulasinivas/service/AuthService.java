package com.sritulasinivas.service;

import com.sritulasinivas.dto.AuthRequest;
import com.sritulasinivas.dto.AuthResponse;
import com.sritulasinivas.dto.RegisterRequest;
import com.sritulasinivas.entity.User;
import com.sritulasinivas.repository.UserRepository;
import com.sritulasinivas.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;

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

    @Autowired
    private Environment environment;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }

        String verificationToken = String.format("%06d",
                new java.security.SecureRandom().nextInt(1_000_000));

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
        user.setTokenExpiresAt(LocalDateTime.now().plusMinutes(10));

        User savedUser = userRepository.save(user);

        boolean isLocal = Arrays.asList(environment.getActiveProfiles()).contains("local");
        if (isLocal) {
            // Auto-verify in local dev (no mail server)
            savedUser.setEmailVerified(true);
            savedUser.setIsActive(true);
            savedUser.setVerificationToken(null);
            savedUser.setTokenExpiresAt(null);
            userRepository.save(savedUser);
        } else {
            emailService.sendOtpEmail(savedUser.getEmail(), savedUser.getFirstName(), verificationToken);
        }

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
    public Map<String, String> verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found."));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return Map.of("message", "Email already verified. You can now log in.");
        }

        if (user.getVerificationToken() == null || !user.getVerificationToken().equals(otp)) {
            throw new RuntimeException("Invalid OTP. Please check your email and try again.");
        }

        if (user.getTokenExpiresAt() != null && LocalDateTime.now().isAfter(user.getTokenExpiresAt())) {
            throw new RuntimeException("OTP has expired. Please register again.");
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
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password. Please try again.");
        } catch (DisabledException e) {
            throw new RuntimeException("Your email address is not verified. Please check your inbox for the verification code.");
        }
    }

    @Transactional
    public Map<String, String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("No account found with that email address."));

        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
        user.setVerificationToken(otp);
        user.setTokenExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getFirstName(), otp);
        return Map.of("message", "Password reset code sent to your email. It expires in 10 minutes.");
    }

    @Transactional
    public Map<String, String> resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("No account found with that email address."));

        if (user.getVerificationToken() == null || !user.getVerificationToken().equals(otp)) {
            throw new RuntimeException("Invalid code. Please check your email and try again.");
        }
        if (user.getTokenExpiresAt() != null && LocalDateTime.now().isAfter(user.getTokenExpiresAt())) {
            throw new RuntimeException("This code has expired. Please request a new one.");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setVerificationToken(null);
        user.setTokenExpiresAt(null);
        userRepository.save(user);

        return Map.of("message", "Password reset successfully! You can now log in.");
    }
}
