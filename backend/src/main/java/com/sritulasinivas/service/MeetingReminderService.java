package com.sritulasinivas.service;

import com.sritulasinivas.entity.Meeting;
import com.sritulasinivas.repository.MeetingRepository;
import com.sritulasinivas.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;

@Service
@Slf4j
public class MeetingReminderService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WhatsAppService whatsAppService;

    /**
     * Runs every 60 seconds. Checks all pending meetings and sends WhatsApp reminders
     * when the selected reminder window is reached.
     */
    @Scheduled(fixedRate = 60_000)
    public void checkAndSendReminders() {
        List<Meeting> meetings = meetingRepository.findByReminderSentFalseAndStatusNot("Cancelled");
        LocalDateTime now = LocalDateTime.now();

        for (Meeting meeting : meetings) {
            String reminderOpt = meeting.getReminderOption();
            if (reminderOpt == null || "NONE".equals(reminderOpt)) continue;

            LocalDateTime meetingDt = resolveMeetingDateTime(meeting);
            if (meetingDt == null) continue;

            long minutesUntil = ChronoUnit.MINUTES.between(now, meetingDt);
            boolean shouldSend = switch (reminderOpt) {
                case "AT_TIME" -> minutesUntil >= 0  && minutesUntil <= 1;
                case "30_MIN"  -> minutesUntil >= 29 && minutesUntil <= 31;
                case "45_MIN"  -> minutesUntil >= 44 && minutesUntil <= 46;
                case "1_HOUR"  -> minutesUntil >= 59 && minutesUntil <= 61;
                case "1_DAY"   -> minutesUntil >= 1439 && minutesUntil <= 1441;
                default -> false;
            };

            if (shouldSend) {
                log.info("Sending {} reminder for meeting '{}' ({}m away)", reminderOpt, meeting.getTitle(), minutesUntil);
                String label = reminderLabel(reminderOpt);
                sendMeetingMessage(meeting, "*Meeting Reminder* (" + label + ")");
                meeting.setReminderSent(true);
                meetingRepository.save(meeting);
            }
        }
    }

    /**
     * Called immediately after a meeting is created when immediateNotify = true.
     */
    public void sendImmediateNotification(Meeting meeting) {
        log.info("Sending immediate WhatsApp notification for meeting '{}'", meeting.getTitle());
        sendMeetingMessage(meeting, "*Meeting Scheduled*");
        meeting.setNotificationSent(true);
        meetingRepository.save(meeting);
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Private helpers
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private void sendMeetingMessage(Meeting meeting, String header) {
        List<Map<String, String>> recipients = resolveRecipients(meeting);
        if (recipients.isEmpty()) {
            log.warn("No WhatsApp recipients found for meeting '{}' - not sent.", meeting.getTitle());
            return;
        }
        // Send personalized message to each recipient individually
        for (Map<String, String> recipient : recipients) {
            String name = recipient.getOrDefault("name", "Resident");
            String phone = recipient.get("phone");
            String body = buildMessageBody(meeting, header, name);
            whatsAppService.sendMessage(phone, body);
        }
    }

    /**
     * Returns a list of {phone, apiKey} maps for the meeting's notify type.
     * GROUP  â†’ all active users who have both phone and whatsappApiKey set.
     * INDIVIDUAL â†’ recipients field is comma-separated phone numbers;
     *              apiKey is looked up from the user profile.
     */
    private List<Map<String, String>> resolveRecipients(Meeting meeting) {
        String notifyType = meeting.getNotifyType();

        if ("GROUP".equals(notifyType)) {
            return userRepository.findAll().stream()
                    .filter(u -> Boolean.TRUE.equals(u.getIsActive())
                            && u.getPhone() != null && !u.getPhone().isBlank())
                    .map(u -> {
                        Map<String, String> m = new HashMap<>();
                        m.put("phone", normalizePhone(u.getPhone()));
                        m.put("name", u.getFirstName() + " " + u.getLastName());
                        return m;
                    })
                    .collect(Collectors.toList());

        } else if ("INDIVIDUAL".equals(notifyType) && meeting.getRecipients() != null) {
            return Arrays.stream(meeting.getRecipients().split(","))
                    .map(String::trim)
                    .filter(p -> !p.isBlank())
                    .map(entry -> {
                        Map<String, String> m = new HashMap<>();
                        if (entry.contains("::")) {
                            // New format from attendee picker: "Full Name::phoneNumber"
                            String[] parts = entry.split("::", 2);
                            m.put("name", parts[0].trim());
                            m.put("phone", normalizePhone(parts[1].trim()));
                        } else {
                            // Legacy format: plain phone number — look up name from DB
                            String phone = normalizePhone(entry);
                            m.put("phone", phone);
                            userRepository.findByPhone(entry.replaceAll("[^0-9]", ""))
                                    .ifPresent(u -> m.put("name", u.getFirstName() + " " + u.getLastName()));
                            if (!m.containsKey("name")) m.put("name", "Resident");
                        }
                        return m;
                    })
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    /** Adds +91 country code if the number doesn't already start with '+'. */
    private String normalizePhone(String raw) {
        String digits = raw.replaceAll("[^+0-9]", "");
        return digits.startsWith("+") ? digits : "+91" + digits;
    }

    private String buildMessageBody(Meeting meeting, String header, String recipientName) {
        String greeting = timeGreeting();
        String divider = "----------------------------------";

        StringBuilder sb = new StringBuilder();
        sb.append(greeting).append("\n\n");
        sb.append("Dear ").append(recipientName).append(",\n\n");
        sb.append(header).append("\n\n");
        sb.append(divider).append("\n");
        sb.append("*Meeting Details*").append("\n");
        sb.append(divider).append("\n");
        sb.append(String.format("%-9s: %s%n", "Meeting", meeting.getTitle()));
        sb.append(String.format("%-9s: %s%n", "Date", formatDate(meeting.getDate())));
        if (meeting.getTime() != null && !meeting.getTime().isBlank()) {
            sb.append(String.format("%-9s: %s%n", "Time", meeting.getTime()));
        }
        if (meeting.getVenue() != null && !meeting.getVenue().isBlank()) {
            sb.append(String.format("%-9s: %s%n", "Venue", meeting.getVenue()));
        }
        if (meeting.getAgendaPoints() != null && !meeting.getAgendaPoints().isBlank()) {
            sb.append(String.format("%-9s: %s%n", "Agenda", meeting.getAgendaPoints()));
        }
        sb.append(divider).append("\n\n");
        sb.append("Your presence and participation is highly valuable\n");
        sb.append("for our community decisions.\n\n");
        sb.append("Please make it a priority to attend.\n\n");
        sb.append("Thank you!\n");
        sb.append("*Sri Tulasi Nivas Association*\n");
        sb.append("Hyderabad, Telangana");
        return sb.toString();
    }

    private String timeGreeting() {
        int hour = LocalTime.now().getHour();
        if (hour < 12) return "Good Morning!";
        if (hour < 17) return "Good Afternoon!";
        return "Good Evening!";
    }

    private String formatDate(LocalDate date) {
        if (date == null) return "";
        return date.format(DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy", Locale.ENGLISH));
    }

    private String reminderLabel(String opt) {
        return switch (opt) {
            case "AT_TIME" -> "at meeting time";
            case "30_MIN"  -> "30 minutes before";
            case "45_MIN"  -> "45 minutes before";
            case "1_HOUR"  -> "1 hour before";
            case "1_DAY"   -> "1 day before";
            default -> opt;
        };
    }

    private LocalDateTime resolveMeetingDateTime(Meeting meeting) {
        try {
            LocalDate date = meeting.getDate();
            if (meeting.getTime() == null || meeting.getTime().isBlank()) {
                return date.atTime(10, 0);
            }
            String timeStr = meeting.getTime().trim().toUpperCase(Locale.ROOT);
            LocalTime localTime;
            if (timeStr.contains("M")) {
                // Normalize: insert space before AM/PM if missing (e.g. "10:00AM" → "10:00 AM")
                timeStr = timeStr.replaceAll("(?i)(\\d)(AM|PM)$", "$1 $2").toUpperCase(Locale.ROOT);
                DateTimeFormatter fmt = timeStr.contains(":")
                        ? DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH)
                        : DateTimeFormatter.ofPattern("h a", Locale.ENGLISH);
                localTime = LocalTime.parse(timeStr, fmt);
            } else {
                localTime = LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("H:mm"));
            }
            return date.atTime(localTime);
        } catch (Exception e) {
            log.warn("Could not parse time '{}' for meeting '{}': {}", meeting.getTime(), meeting.getTitle(), e.getMessage());
            return null;
        }
    }
}