package com.sritulasinivas.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "meetings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Meeting {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDate date;

    private String time;
    private String venue = "Clubhouse";
    private int attendees = 0;

    @Column(columnDefinition = "TEXT")
    private String agendaPoints;

    @Column(columnDefinition = "TEXT")
    private String momPoints;

    @Column(columnDefinition = "TEXT")
    private String actionItems;

    @Column(columnDefinition = "TEXT")
    private String actionOwners;

    private String status = "Upcoming";

    // WhatsApp notification settings
    private String reminderOption = "NONE"; // NONE, AT_TIME, 30_MIN, 45_MIN, 1_HOUR, 1_DAY

    private String notifyType = "NONE"; // NONE, GROUP, INDIVIDUAL

    @Column(columnDefinition = "TEXT")
    private String recipients; // comma-separated phone numbers (for INDIVIDUAL type)

    private boolean immediateNotify = false; // send WhatsApp on creation

    @Column(columnDefinition = "boolean default false")
    private boolean reminderSent = false;

    @Column(columnDefinition = "boolean default false")
    private boolean notificationSent = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
