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
                sendMeetingMessage(meeting, "â° *Meeting Reminder* (" + label + ")");
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
        sendMeetingMessage(meeting, "ðŸ“¢ *Meeting Scheduled*");
        meeting.setNotificationSent(true);
        meetingRepository.save(meeting);
    }

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Private helpers
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private void sendMeetingMessage(Meeting meeting, String header) {
        List<Map<String, String>> recipients = resolveRecipients(meeting);
        if (recipients.isEmpty()) {
            log.warn("No WhatsApp recipients found for meeting '{}' â€” not sent.", meeting.getTitle());
            return;
        }
        String body = buildMessageBody(meeting, header);
        whatsAppService.sendToRecipients(recipients, body);
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
                            && u.getPhone() != null && !u.getPhone().isBlank()
                            && u.getWhatsappApiKey() != null && !u.getWhatsappApiKey().isBlank())
                    .map(u -> Map.of("phone", normalizePhone(u.getPhone()),
                                     "apiKey", u.getWhatsappApiKey()))
                    .collect(Collectors.toList());

        } else if ("INDIVIDUAL".equals(notifyType) && meeting.getRecipients() != null) {
            return Arrays.stream(meeting.getRecipients().split(","))
                    .map(String::trim)
                    .filter(p -> !p.isBlank())
                    .map(this::normalizePhone)
                    .map(phone -> userRepository.findByPhone(rawDigits(phone))
                            .or(() -> userRepository.findByPhone(phone))
                            .map(u -> u.getWhatsappApiKey() != null
                                    ? Map.of("phone", phone, "apiKey", u.getWhatsappApiKey())
                                    : null)
                            .orElse(null))
                    .filter(m -> m != null)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    /** Adds +91 country code if the number doesn't already start with '+'. */
    private String normalizePhone(String raw) {
        String digits = raw.replaceAll("[^+0-9]", "");
        return digits.startsWith("+") ? digits : "+91" + digits;
    }

    /** Returns only the digit portion (no + or country code prefix). */
    private String rawDigits(String e164) {
        return e164.replaceAll("[^0-9]", "");
    }

    private String buildMessageBody(Meeting meeting, String header) {
        StringBuilder sb = new StringBuilder();
        sb.append(header).append("\n\n");
        sb.append("*Sri Tulasi Nivas* ðŸ¢\n\n");
        sb.append("ðŸ“Œ *").append(meeting.getTitle()).append("*\n");
        sb.append("ðŸ“† Date: ").append(meeting.getDate()).append("\n");
        if (meeting.getTime() != null && !meeting.getTime().isBlank()) {
            sb.append("ðŸ• Time: ").append(meeting.getTime()).append("\n");
        }
        if (meeting.getVenue() != null && !meeting.getVenue().isBlank()) {
            sb.append("ðŸ“ Venue: ").append(meeting.getVenue()).append("\n");
        }
        if (meeting.getAgendaPoints() != null && !meeting.getAgendaPoints().isBlank()) {
            sb.append("\nðŸ“‹ *Agenda:*\n").append(meeting.getAgendaPoints()).append("\n");
        }
        sb.append("\nThank you! ðŸ™");
        return sb.toString();
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
                DateTimeFormatter fmt = timeStr.contains(":")
                        ? DateTimeFormatter.ofPattern("h:mm a")
                        : DateTimeFormatter.ofPattern("h a");
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