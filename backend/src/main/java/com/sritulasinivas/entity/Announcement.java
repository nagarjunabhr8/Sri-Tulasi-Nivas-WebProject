package com.sritulasinivas.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Maps to the 'updates' table — community announcements / notice board.
 */
@Entity
@Table(name = "updates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    private String category = "General";
    private String postedBy;
    private String priority = "Normal";
    private String status = "Active";

    @CreationTimestamp
    private LocalDateTime createdAt;
}
