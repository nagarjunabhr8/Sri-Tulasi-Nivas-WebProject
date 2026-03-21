package com.sritulasinivas.service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.sritulasinivas.dto.EventDTO;
import com.sritulasinivas.entity.Event;
import com.sritulasinivas.entity.EventContribution;
import com.sritulasinivas.entity.User;
import com.sritulasinivas.repository.EventContributionRepository;
import com.sritulasinivas.repository.EventRepository;
import com.sritulasinivas.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class PaymentService {

    @Autowired
    private EventContributionRepository contributionRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Transactional
    public String createPaymentIntent(Long userId, Long eventId, BigDecimal amount) {
        Stripe.apiKey = stripeApiKey;

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount.longValue() * 100) // Convert to cents
                .setCurrency("usd")
                .setDescription("Event contribution for " + event.getTitle())
                .build();

            PaymentIntent intent = PaymentIntent.create(params);

            EventContribution contribution = new EventContribution();
            contribution.setUser(user);
            contribution.setEvent(event);
            contribution.setAmount(amount);
            contribution.setPaymentIntentId(intent.getId());
            contribution.setStatus("PENDING");

            contributionRepository.save(contribution);

            return intent.getClientSecret();
        } catch (Exception e) {
            throw new RuntimeException("Payment intent creation failed: " + e.getMessage());
        }
    }

    @Transactional
    public void confirmPayment(String paymentIntentId) {
        EventContribution contribution = contributionRepository.findByPaymentIntentId(paymentIntentId)
            .orElseThrow(() -> new RuntimeException("Contribution not found"));

        contribution.setStatus("COMPLETED");
        contributionRepository.save(contribution);
    }
}
