package com.sritulasinivas.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url:https://sritulasinivas.vercel.app}")
    private String frontendUrl;

    public void sendVerificationEmail(String toEmail, String firstName, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify your Sri Tulasi Nivas account");

            String verifyUrl = frontendUrl + "/verify-email?token=" + token;
            String html = buildEmailHtml(firstName, verifyUrl);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Verification email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }
    }

    private String buildEmailHtml(String firstName, String verifyUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #2c3e50; text-align: center; margin-bottom: 4px;">Sri Tulasi Nivas</h2>
                <p style="color: #888; text-align: center; margin-top: 0; margin-bottom: 30px;">Community Management Portal</p>
                <h3 style="color: #34495e;">Welcome, %s!</h3>
                <p style="color: #555; line-height: 1.6;">
                  Thank you for registering with Sri Tulasi Nivas Community.<br>
                  Please verify your email address to activate your account.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="%s"
                     style="background: #3498db; color: white; padding: 14px 32px; text-decoration: none;
                            border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                    Verify Email Address
                  </a>
                </div>
                <p style="color: #888; font-size: 13px;">
                  This link expires in <strong>24 hours</strong>. If you did not register, you can safely ignore this email.
                </p>
                <p style="color: #aaa; font-size: 12px; margin-top: 16px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="%s" style="color: #3498db; word-break: break-all;">%s</a>
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="color: #bbb; font-size: 11px; text-align: center; margin: 0;">
                  Sri Tulasi Nivas Community &bull; Hyderabad, Telangana
                </p>
              </div>
            </body>
            </html>
            """.formatted(firstName, verifyUrl, verifyUrl, verifyUrl);
    }
}
