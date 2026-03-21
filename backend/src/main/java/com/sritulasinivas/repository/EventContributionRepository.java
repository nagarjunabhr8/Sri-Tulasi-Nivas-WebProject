package com.sritulasinivas.repository;

import com.sritulasinivas.entity.EventContribution;
import com.sritulasinivas.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventContributionRepository extends JpaRepository<EventContribution, Long> {
    List<EventContribution> findByUser(User user);
    List<EventContribution> findByEventId(Long eventId);
    Optional<EventContribution> findByPaymentIntentId(String paymentIntentId);
}
