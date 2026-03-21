package com.sritulasinivas.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Sends WhatsApp messages via Twilio WhatsApp API.
 *
 * Setup (one-time):
 *   1. Create a free account at https://www.twilio.com
 *   2. Go to Messaging → Try it out → Send a WhatsApp message (Sandbox)
 *   3. Copy your Account SID and Auth Token from the Twilio Console
 *   4. Note your sandbox join code (e.g. "join bright-elephant")
 *   5. Each resident sends that join code to +14155238886 on WhatsApp to opt in
 *   6. Add credentials to application-local.yml:
 *        twilio:
 *          account-sid: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *          auth-token: your_auth_token
 *          whatsapp-from: whatsapp:+14155238886
 */
@Service
@Slf4j
public class WhatsAppService {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.whatsapp-from:whatsapp:+14155238886}")
    private String fromNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isConfigured() {
        return accountSid != null && !accountSid.isBlank()
            && authToken  != null && !authToken.isBlank();
    }

    /**
     * Send one WhatsApp message to a single recipient.
     * @param phone  recipient's E.164 number, e.g. "+919876543210"
     * @param text   message body
     */
    public void sendMessage(String phone, String text) {
        if (!isConfigured()) {
            log.warn("Twilio credentials not configured — WhatsApp skipped for {}", phone);
            return;
        }
        sendSingle(phone, text);
    }

    /**
     * Send to multiple recipients.
     * @param recipients list of maps, each with at least a "phone" key
     * @param text       message body
     */
    public void sendToRecipients(List<Map<String, String>> recipients, String text) {
        if (!isConfigured() || recipients == null || recipients.isEmpty()) return;

        recipients.stream()
                .filter(r -> r.get("phone") != null && !r.get("phone").isBlank())
                .forEach(r -> sendSingle(r.get("phone"), text));
    }

    private void sendSingle(String phone, String text) {
        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

            String credentials = Base64.getEncoder()
                    .encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "Basic " + credentials);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("From", fromNumber);
            body.add("To", "whatsapp:" + phone);
            body.add("Body", text);

            var response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), String.class);
            log.info("Twilio response [{}] for {}: {}", response.getStatusCode(), phone, response.getBody());
        } catch (Exception e) {
            log.error("Failed to send WhatsApp message to {}: {}", phone, e.getMessage());
        }
    }
}
