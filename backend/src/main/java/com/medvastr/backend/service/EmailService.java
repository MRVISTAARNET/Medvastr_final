package com.medvastr.backend.service;

import com.medvastr.backend.model.Inquiry;
import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderItem;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.text.NumberFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.host}")
    private String smtpHost;

    @Value("${spring.mail.port}")
    private String smtpPort;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.mail.properties.mail.smtp.ssl.enable}")
    private String sslEnabled;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable}")
    private String starttlsEnabled;

    @Value("${app.frontend.url:https://medvastr.com}")
    private String frontendUrl;

    @PostConstruct
    public void logSmtpConfig() {
        log.info("========== SMTP DIAGNOSTICS ==========");
        log.info("SMTP Host: {}", smtpHost);
        log.info("SMTP Port: {}", smtpPort);
        log.info("SMTP SSL Enabled: {}", sslEnabled);
        log.info("SMTP STARTTLS Enabled: {}", starttlsEnabled);
        String maskedUser = (fromEmail != null && fromEmail.length() > 3)
                ? fromEmail.substring(0, 3) + "****"
                : "NOT SET";
        log.info("SMTP Username: {}", maskedUser);
        log.info("Frontend URL: {}", frontendUrl);
        if (fromEmail == null || fromEmail.isEmpty()) {
            log.error("CRITICAL: spring.mail.username (MAIL_USERNAME) is NOT SET. Emails will fail.");
        }
        log.info("======================================");
    }

    private static final String BRAND_COLOR = "#008080";
    private static final String SECONDARY_COLOR = "#1a2b4a";

    @Async
    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/auth-verify?token=" + token;
        String html = getPasswordResetHtml(toEmail, resetLink);
        sendHtmlEmail(toEmail, "Reset Your Medvastr Password", html, "support@medvastr.com", "Medvastr Support");
    }

    @Async
    public void sendOrderConfirmationEmail(Order order) {
        String customerEmail = order.getUser().getEmail();
        String subject = "Order Confirmed - " + order.getOrderNumber();
        log.info("[EmailService] Sending order confirmation - Customer Email: {} | Subject: {}", customerEmail,
                subject);

        try {
            String html = getOrderConfirmationHtml(order);
            sendHtmlEmailInner(customerEmail, subject, html, "orders@medvastr.com", "Medvastr Orders");
            log.info("[EmailService] Order Confirmation Status: SUCCESS | Customer Email: {} | Subject: {}",
                    customerEmail, subject);
        } catch (Exception ex) {
            log.error("[EmailService] Order Confirmation Status: FAILED | Customer Email: {} | Subject: {}",
                    customerEmail, subject, ex);
            // We log the complete stack trace and do not throw, so order creation does not
            // fail.
        }
    }

    @Async
    public void sendAdminNotification(Order order) {
        String adminEmail = "admin@medvastr.com";
        String subject = "New Order Received - " + order.getOrderNumber();
        log.info("[EmailService] Sending admin notification - Admin Email: {} | Subject: {}", adminEmail, subject);

        try {
            String html = getOrderConfirmationHtml(order);
            sendHtmlEmailInner(adminEmail, subject, html, "orders@medvastr.com", "Medvastr Bot");
            log.info("[EmailService] Admin Notification Status: SUCCESS | Admin Email: {} | Subject: {}", adminEmail,
                    subject);
        } catch (Exception ex) {
            log.error("[EmailService] Admin Notification Status: FAILED | Admin Email: {} | Subject: {}", adminEmail,
                    subject, ex);
        }
    }

    @Async
    public void sendInquiryNotification(Inquiry i) {
        String safeName = HtmlUtils.htmlEscape(i.getName());
        String safeEmail = HtmlUtils.htmlEscape(i.getEmail());
        String safePhone = HtmlUtils.htmlEscape(i.getPhone() != null ? i.getPhone() : "");
        String safeMessage = HtmlUtils.htmlEscape(i.getMessage());
        String safeType = HtmlUtils.htmlEscape(i.getType());

        String html = "<h2>New " + safeType + "</h2>" +
                "<p><b>Name:</b> " + safeName + "</p>" +
                "<p><b>Email:</b> " + safeEmail + "</p>" +
                "<p><b>Phone:</b> " + safePhone + "</p>" +
                "<p><b>Message:</b> " + safeMessage + "</p>";
        sendHtmlEmail("info@medvastr.com", "New Inquiry: " + i.getType(), html, "no-reply@medvastr.com",
                "Medvastr Bot");

        String replyHtml = "<p>Hi " + safeName
                + ",</p><p>We received your inquiry and our team will get back to you within 24 hours.</p><p>Regards,<br>Medvastr Team</p>";
        sendHtmlEmail(i.getEmail(), "Inquiry Received", replyHtml, "info@medvastr.com", "Medvastr Support");
    }

    @Async
    public void sendOtpEmail(String toEmail, String otpCode) {
        String html = """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: #1a2b4a; padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">Your Login OTP</h1>
                    </div>
                    <div style="padding: 40px; color: #333; line-height: 1.6;">
                        <p>Hello,</p>
                        <p>Use the following One-Time Password (OTP) to complete your login or registration at Medvastr:</p>
                        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 12px; border: 2px solid #eee;">
                            <span style="font-size: 32px; font-weight: bold; color: #008080; letter-spacing: 5px;">%s</span>
                        </div>
                        <p style="font-size: 13px; color: #666;">This code is valid for 10 minutes. Please do not share this OTP with anyone.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 14px;">Team Medvastr</p>
                    </div>
                </div>
                """
                .formatted(otpCode);
        sendHtmlEmail(toEmail, "Your Medvastr Verification Code", html, "info@medvastr.com", "Medvastr");
    }

    @Async
    public void sendNewsletterWelcomeEmail(String toEmail) {
        String html = """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: %s; padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">Welcome to Medvastr!</h1>
                    </div>
                    <div style="padding: 40px; color: #333; line-height: 1.6;">
                        <p>Hello,</p>
                        <p>Thank you for subscribing to the Medvastr newsletter!</p>
                        <p>As a thank you, here is your welcome discount code:</p>
                        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 12px; border: 2px dashed #008080;">
                            <span style="font-size: 24px; font-weight: bold; color: #008080; letter-spacing: 2px;">MEDVASTR10</span>
                            <div style="font-size: 12px; color: #666; margin-top: 5px;">Use this code at checkout for 10%% OFF your first order.</div>
                        </div>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 14px;">Team Medvastr</p>
                    </div>
                </div>
                """
                .formatted(BRAND_COLOR);
        sendHtmlEmail(toEmail, "Welcome to Medvastr - You're Subscribed!", html, "info@medvastr.com", "Medvastr");
    }

    private void sendHtmlEmailInner(String to, String subject, String body, String alias, String aliasName)
            throws Exception {
        if (fromEmail == null || fromEmail.isEmpty()) {
            throw new IllegalStateException(
                    "SMTP Username (fromEmail) is not configured. Check MAIL_USERNAME environment variable.");
        }

        log.debug("[EmailService] Creating MimeMessage for recipient: {} | Subject: {}", to, subject);
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

        helper.setFrom(fromEmail, aliasName);
        helper.setReplyTo(alias);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true);

        log.info("[EmailService] Attempting to send email via {} to {}", smtpHost, to);
        mailSender.send(msg);
        log.info("[EmailService] SMTP Send successful to {}", to);
    }

    private void sendHtmlEmail(String to, String subject, String body, String alias, String aliasName) {
        try {
            sendHtmlEmailInner(to, subject, body, alias, aliasName);
            log.info("[EmailService] Email sent to {} | Subject: {} | Status: SUCCESS", to, subject);
        } catch (Exception ex) {
            log.error("[EmailService] Failed to send email to {} | Subject: {} | Status: FAILED", to, subject, ex);
        }
    }

    private String getPasswordResetHtml(String email, String link) {
        return """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: %s; padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">Password Reset</h1>
                    </div>
                    <div style="padding: 40px; color: #333; line-height: 1.6;">
                        <p>Hello,</p>
                        <p>We received a request to reset your password for <b>%s</b>.</p>
                        <p>Click the button below to secure your account:</p>
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="%s" style="background: %s; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
                        </div>
                        <p style="font-size: 13px; color: #666;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 14px;">Team Medvastr</p>
                    </div>
                </div>
                """
                .formatted(SECONDARY_COLOR, HtmlUtils.htmlEscape(email), link, BRAND_COLOR);
    }

    private String getOrderConfirmationHtml(Order order) {
        NumberFormat nf = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        StringBuilder itemsHtml = new StringBuilder();

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemsHtml.append("""
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                <div style="font-weight: bold;">%s</div>
                                <div style="font-size: 12px; color: #666;">Size: %s | Color: %s</div>
                            </td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">%d × %s</td>
                        </tr>
                        """.formatted(
                        HtmlUtils.htmlEscape(item.getProductName()),
                        HtmlUtils.htmlEscape(item.getSize()),
                        HtmlUtils.htmlEscape(item.getColorName()),
                        item.getQuantity(),
                        nf.format(item.getUnitPrice())));
            }
        }

        return """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: %s; padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">Order Confirmed!</h1>
                        <p style="margin: 8px 0 0; opacity: 0.8;">Thank you for shopping with Medvastr</p>
                    </div>
                    <div style="padding: 40px; color: #333; line-height: 1.6;">
                        <p>Hello <b>%s</b>,</p>
                        <p>Your order <b>#%s</b> has been successfully placed. We're getting it ready for shipment!</p>
                        <div style="background: #fdfdfd; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
                            <table style="width: 100%%; border-collapse: collapse;">
                                %s
                                <tr>
                                    <td style="padding: 20px 0 0; font-weight: bold;">Total Amount</td>
                                    <td style="padding: 20px 0 0; text-align: right; font-weight: bold; color: %s; font-size: 18px;">%s</td>
                                </tr>
                            </table>
                        </div>
                        <div style="margin-top: 25px;">
                            <h3 style="font-size: 16px;">Shipping Address</h3>
                            <p style="font-size: 14px; color: #555; margin: 5px 0;">
                                %s<br>%s, %s - %s
                            </p>
                        </div>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 14px;">Questions about your order? Reach us at <a href="mailto:support@medvastr.com" style="color: %s;">support@medvastr.com</a></p>
                    </div>
                    <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                        © 2026 Medvastr | Premium Medical Apparel
                    </div>
                </div>
                """
                .formatted(
                        BRAND_COLOR,
                        HtmlUtils.htmlEscape(order.getShippingName()),
                        HtmlUtils.htmlEscape(order.getOrderNumber()),
                        itemsHtml.toString(),
                        BRAND_COLOR,
                        nf.format(order.getTotalAmount()),
                        HtmlUtils.htmlEscape(order.getShippingAddress()),
                        HtmlUtils.htmlEscape(order.getShippingCity()),
                        HtmlUtils.htmlEscape(order.getShippingState()),
                        HtmlUtils.htmlEscape(order.getShippingPincode()),
                        BRAND_COLOR);
    }
}
