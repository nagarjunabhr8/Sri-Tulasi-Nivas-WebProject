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

    public void sendOtpEmail(String toEmail, String firstName, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Your Sri Tulasi Nivas verification code: " + otp);
            helper.setText(buildOtpEmailHtml(firstName, otp), true);
            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }
    }

    private String buildOtpEmailHtml(String firstName, String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
              <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px;
                          padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                <h2 style="color: #2c3e50; margin-bottom: 4px;">Sri Tulasi Nivas</h2>
                <p style="color: #888; margin-top: 0; margin-bottom: 30px;">Community Management Portal</p>

                <h3 style="color: #34495e; text-align: left;">Hello, %s!</h3>
                <p style="color: #555; text-align: left; line-height: 1.6;">
                  Use the verification code below to complete your registration.
                  This code is valid for <strong>10 minutes</strong>.
                </p>

                <div style="background: #f0f7ff; border: 2px dashed #3498db; border-radius: 12px;
                            padding: 28px 20px; margin: 28px 0;">
                  <p style="color: #888; font-size: 13px; margin: 0 0 10px 0;">Your verification code</p>
                  <div style="font-size: 42px; font-weight: 900; letter-spacing: 14px;
                              color: #2c3e50; font-family: monospace;">%s</div>
                </div>

                <p style="color: #e74c3c; font-size: 13px;">
                  Do NOT share this code with anyone.
                </p>
                <p style="color: #aaa; font-size: 12px;">
                  If you did not register, please ignore this email.
                </p>

                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="color: #bbb; font-size: 11px; margin: 0;">
                  Sri Tulasi Nivas Community &bull; Hyderabad, Telangana
                </p>
              </div>
            </body>
            </html>
            """.formatted(firstName, otp);
    }
}
