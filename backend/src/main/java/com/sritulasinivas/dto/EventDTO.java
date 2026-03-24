package com.sritulasinivas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private String location;
    private BigDecimal estimatedBudget;
    private String status;
    private Integer contributionCount;
    private BigDecimal totalContributed;
    private String festivalLink;
    private String initiatedBy;
    private Map<String, Long> rsvpCounts;
    private String userRsvp;
}
