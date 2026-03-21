package com.sritulasinivas.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Sends WhatsApp messages through:
 *   Spring Boot  →  Google Apps Script Web App  →  CallMeBot API  →  WhatsApp
 *
 * No paid services or SDKs required.
 * Configure the Apps Script Web App URL in application-local.yml:
 *   google.apps-script.whatsapp-url: <your-deployment-url>
 */
@Service
@Slf4j
public class WhatsAppService {

    @Value("${google.apps-script.whatsapp-url:}")
    private String appsScriptUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isConfigured() {
        return appsScriptUrl != null && !appsScriptUrl.isBlank();
    }

    /**
     * Send one WhatsApp message.
     * @param phone   recipient's E.164 number, e.g. "+919876543210"
     * @param apiKey  CallMeBot API key that the recipient registered
     * @param text    message body
     */
    public void sendMessage(String phone, String apiKey, String text) {
        if (!isConfigured()) {
            log.warn("Apps Script URL not configured — WhatsApp skipped for {}", phone);
            return;
        }
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("No CallMeBot API key for {} — WhatsApp skipped", phone);
            return;
        }
        sendBatch(List.of(Map.of("phone", phone, "apiKey", apiKey, "text", text)));
    }

    /**
     * Send to multiple recipients.
     * @param recipients list of maps, each with keys "phone" and "apiKey"
     * @param text       message body
     */
    public void sendToRecipients(List<Map<String, String>> recipients, String text) {
        if (!isConfigured() || recipients == null || recipients.isEmpty()) return;

        List<Map<String, String>> messages = recipients.stream()
                .filter(r -> r.get("apiKey") != null && !r.get("apiKey").isBlank()
                          && r.get("phone")  != null && !r.get("phone").isBlank())
                .map(r -> Map.of("phone", r.get("phone"), "apiKey", r.get("apiKey"), "text", text))
                .collect(Collectors.toList());

        if (messages.isEmpty()) {
            log.warn("No recipients with CallMeBot API keys — WhatsApp not sent");
            return;
        }
        sendBatch(messages);
    }

    private void sendBatch(List<Map<String, String>> messages) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("messages", messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            var response = restTemplate.postForEntity(appsScriptUrl, request, String.class);
            log.info("Apps Script response [{}]: {}", response.getStatusCode(), response.getBody());
        } catch (Exception e) {
            log.error("Failed to call Google Apps Script WhatsApp relay: {}", e.getMessage());
        }
    }
}
