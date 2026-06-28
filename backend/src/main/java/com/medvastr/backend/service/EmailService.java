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

    @Value("${spring.mail.properties.mail.smtp.ssl.enable:false}")
    private String sslEnabled;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:false}")
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
        if (frontendUrl != null && frontendUrl.endsWith("/")) {
            frontendUrl = frontendUrl.substring(0, frontendUrl.length() - 1);
        }
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
            String html = getAdminNotificationHtml(order);
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
    public void sendWelcomeEmail(String toEmail, String firstName) {
        String html = """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #008080 0%%, #1a2b4a 100%%); padding: 50px 30px; text-align: center; color: white;">
                        <div style="font-size: 40px; margin-bottom: 20px;">✨</div>
                        <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">Welcome to Medvastr</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">The new standard in medical apparel</p>
                    </div>
                    <div style="padding: 40px; color: #1e293b; line-height: 1.8;">
                        <p style="font-size: 18px; font-weight: 600; margin-top: 0;">Hi %s,</p>
                        <p>We're thrilled to have you join our community of healthcare professionals. Medvastr was founded with a single mission: to provide the heroes of healthcare with apparel that matches their dedication—combining ultimate comfort, professional style, and clinical-grade durability.</p>

                        <div style="background: #f8fafc; border-left: 4px solid #008080; padding: 20px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                            <p style="margin: 0; font-weight: 700; color: #008080; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Your Account Features</p>
                            <ul style="margin: 10px 0 0; padding-left: 20px; font-size: 14px;">
                                <li>Track your orders in real-time</li>
                                <li>Save your favorites to your wishlist</li>
                                <li>Earn loyalty points on every purchase</li>
                                <li>Early access to new collection launches</li>
                            </ul>
                        </div>

                        <p>Ready to upgrade your work gear? Explore our latest collections of precision-engineered scrubs and medical essentials.</p>

                        <div style="text-align: center; margin: 40px 0;">
                            <a href="%s" style="background: #008080; color: white; padding: 16px 35px; text-decoration: none; border-radius: 12px; font-weight: 800; display: inline-block; box-shadow: 0 10px 20px rgba(0, 128, 128, 0.2);">Explore Collection</a>
                        </div>

                        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 40px 0;">
                        <p style="font-size: 14px; text-align: center; color: #64748b;">If you have any questions, our support team is always here to help.</p>
                        <p style="font-size: 15px; font-weight: 700; text-align: center; color: #1a2b4a; margin-bottom: 0;">Team Medvastr</p>
                    </div>
                    <div style="background: #f9fafb; padding: 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                        &copy; 2026 Medvastr | Premium Medical Apparel<br>
                        Express Zone, Malad East, Mumbai – 400063
                    </div>
                </div>
                """
                .formatted(firstName, frontendUrl);
        sendHtmlEmail(toEmail, "Welcome to the Medvastr Community", html, "support@medvastr.com", "Medvastr Welcome");
    }

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
        try {
            sendHtmlEmailInner(toEmail, "Your Medvastr Verification Code", html, "info@medvastr.com", "Medvastr");
        } catch (Exception e) {
            log.error("Failed to send OTP", e);
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
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

    private String getAdminNotificationHtml(Order order) {
        NumberFormat nf = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        StringBuilder itemsHtml = new StringBuilder();

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemsHtml.append("""
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                        <strong>%s</strong> (x%d)<br>
                                        <span style="font-size: 12px; color: #666;">Size: %s | Color: %s</span>
                                    </td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
                                        %s
                                    </td>
                                </tr>
                                """
                                .formatted(
                                        HtmlUtils.htmlEscape(item.getProductName()),
                                        item.getQuantity(),
                                        HtmlUtils.htmlEscape(item.getSize()),
                                        HtmlUtils.htmlEscape(item.getColorName()),
                                        nf.format(item.getTotalPrice())));
            }
        }

        return """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: %s; padding: 20px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 22px;">New Order Received</h1>
                    </div>
                    <div style="padding: 30px; color: #333; line-height: 1.6;">
                        <p><strong>Order Number:</strong> %s</p>
                        <p><strong>Customer:</strong> %s (%s)</p>
                        <p><strong>Amount:</strong> %s</p>
                        <p><strong>Payment Method:</strong> %s</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <table style="width: 100%%; border-collapse: collapse;">
                            %s
                        </table>
                        <div style="margin-top: 20px; text-align: center;">
                            <a href="%s/admin/orders" style="background: %s; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View in Dashboard</a>
                        </div>
                    </div>
                </div>
                """
                .formatted(
                        SECONDARY_COLOR,
                        HtmlUtils.htmlEscape(order.getOrderNumber()),
                        HtmlUtils.htmlEscape(order.getShippingName()),
                        HtmlUtils.htmlEscape(order.getUser().getEmail()),
                        nf.format(order.getTotalAmount()),
                        order.getPaymentMethod().name(),
                        itemsHtml.toString(),
                        frontendUrl,
                        BRAND_COLOR);
    }

    private String getOrderConfirmationHtml(Order order) {
        NumberFormat nf = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        StringBuilder itemsHtml = new StringBuilder();

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemsHtml
                        .append("""
                                <tr>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #f1f5f9;">
                                        <div style="font-weight: 700; color: #1e293b; font-size: 15px;">%s</div>
                                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">SIZE: %s &nbsp;|&nbsp; COLOR: %s</div>
                                    </td>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e293b; font-weight: 600;">
                                        %d × %s
                                    </td>
                                </tr>
                                """
                                .formatted(
                                        HtmlUtils.htmlEscape(item.getProductName()),
                                        HtmlUtils.htmlEscape(item.getSize()),
                                        HtmlUtils.htmlEscape(item.getColorName()),
                                        item.getQuantity(),
                                        nf.format(item.getUnitPrice())));
            }
        }

        return """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <div style="background: %s; padding: 50px 30px; text-align: center; color: white;">
                        <div style="font-size: 40px; margin-bottom: 15px;">📦</div>
                        <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px;">Order Confirmed!</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9; font-size: 15px;">Thank you for choosing Medvastr</p>
                    </div>

                    <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
                        <p style="margin-top: 0;">Hi <b>%s</b>,</p>
                        <p>Great news! We've received your order <b>#%s</b> and our team is already working on getting it to you. We'll send you another update as soon as it ships.</p>

                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin: 35px 0;">
                            <h3 style="margin: 0 0 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px;">Order Summary</h3>
                            <table style="width: 100%%; border-collapse: collapse;">
                                %s
                                <tr>
                                    <td style="padding: 25px 0 0; font-weight: 800; color: #1e293b; font-size: 16px;">Total Amount</td>
                                    <td style="padding: 25px 0 0; text-align: right; font-weight: 800; color: %s; font-size: 20px;">%s</td>
                                </tr>
                            </table>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 30px;">
                            <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 15px;">
                                <h4 style="margin: 0 0 8px; font-size: 12px; color: #94a3b8; text-transform: uppercase;">Shipping To</h4>
                                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b; line-height: 1.5;">
                                    %s<br>%s, %s - %s
                                </p>
                            </div>
                        </div>

                        <div style="text-align: center; margin-top: 50px;">
                            <a href="%s/track?order=%s" style="background: #1e293b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">Track Your Order</a>
                        </div>

                        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 40px 0;">
                        <p style="font-size: 13px; text-align: center; color: #94a3b8;">
                            Need help? Reply to this email or visit our <a href="%s/contact" style="color: %s; text-decoration: none; font-weight: 600;">Contact Center</a>.
                        </p>
                    </div>

                    <div style="background: #f9fafb; padding: 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                        © 2026 Medvastr | Premium Medical Apparel<br>
                        Express Zone, Malad East, Mumbai – 400063
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
                        frontendUrl,
                        HtmlUtils.htmlEscape(order.getOrderNumber()),
                        frontendUrl,
                        BRAND_COLOR);
    }
}
