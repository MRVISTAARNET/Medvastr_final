package com.medvastr.backend.service;

import com.medvastr.backend.model.Order;
import com.medvastr.backend.model.OrderItem;
import com.medvastr.backend.model.Inquiry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.text.NumberFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private static final String BRAND_COLOR = "#008080";
    private static final String SECONDARY_COLOR = "#1a2b4a";

    @Async
    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        String html = getPasswordResetHtml(toEmail, resetLink);

        sendHtmlEmail(toEmail, "Reset Your Medvastr Password", html, "support@medvastr.com", "Medvastr Support");
    }

    @Async
    public void sendOrderConfirmationEmail(Order order) {
        String html = getOrderConfirmationHtml(order);
        sendHtmlEmail(order.getUser().getEmail(), "Order Confirmed - " + order.getOrderNumber(), html,
                "orders@medvastr.com", "Medvastr Orders");
    }

    @Async
    public void sendInquiryNotification(Inquiry i) {
        String html = "<h2>New " + i.getType() + "</h2>" +
                "<p><b>Name:</b> " + i.getName() + "</p>" +
                "<p><b>Email:</b> " + i.getEmail() + "</p>" +
                "<p><b>Phone:</b> " + i.getPhone() + "</p>" +
                "<p><b>Message:</b> " + i.getMessage() + "</p>";
        sendHtmlEmail("info@medvastr.com", "New Inquiry: " + i.getType(), html, "no-reply@medvastr.com",
                "Medvastr Bot");
        // Also send auto-reply to user
        String replyHtml = "<p>Hi " + i.getName()
                + ",</p><p>We received your inquiry and our team will get back to you within 24 hours.</p><p>Regards,<br>Medvastr Team</p>";
        sendHtmlEmail(i.getEmail(), "Inquiry Received", replyHtml, "info@medvastr.com", "Medvastr Support");
    }

    @Async
    public void sendOtpEmail(String toEmail, String otpCode) {
        String html = """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: #1a2b4a; padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">🔐 Your Login OTP</h1>
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
        sendHtmlEmail(toEmail, "Your Medvastr Verification Code: " + otpCode, html, "auth@medvastr.com",
                "Medvastr Auth");
    }

    @Async
    public void sendNewsletterWelcomeEmail(String toEmail) {
        String html = """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: %s; padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">Welcome to Medvastr! 🌿</h1>
                    </div>
                    <div style="padding: 40px; color: #333; line-height: 1.6;">
                        <p>Hello,</p>
                        <p>Thank you for subscribing to the Medvastr newsletter! You're now on the list to receive exclusive updates, healthcare style tips, and first access to our new arrivals.</p>
                        <p>As a thank you, here is your welcome discount code:</p>
                        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 12px; border: 2px dashed #008080;">
                            <span style="font-size: 24px; font-weight: bold; color: #008080; letter-spacing: 2px;">MEDVASTR10</span>
                            <div style="font-size: 12px; color: #666; margin-top: 5px;">Use this code at checkout for 10%% OFF your first order.</div>
                        </div>
                        <p>Stay tuned for amazing content!</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 14px;">Team Medvastr</p>
                    </div>
                </div>
                """
                .formatted(BRAND_COLOR);
        sendHtmlEmail(toEmail, "Welcome to Medvastr - You're Subscribed!", html, "info@medvastr.com", "Medvastr");
    }

    private void sendHtmlEmail(String to, String subject, String body, String alias, String aliasName) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setFrom(fromEmail, aliasName);
            helper.setReplyTo(alias);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(msg);
            log.info("[EmailService] Email sent to {} | Subject: {}", to, subject);
        } catch (Exception ex) {
            log.error("[EmailService] Failed to send email to {}: {}", to, ex.getMessage());
        }
    }

    private String getPasswordResetHtml(String email, String link) {
        return """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: %s; padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">🔒 Password Reset</h1>
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
                .formatted(SECONDARY_COLOR, email, link, BRAND_COLOR);
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
                        """.formatted(item.getProductName(), item.getSize(), item.getColorName(), item.getQuantity(),
                        nf.format(item.getUnitPrice())));
            }
        }

        return """
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                    <div style="background: %s; padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">✨ Order Confirmed!</h1>
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
                .formatted(BRAND_COLOR, order.getShippingName(), order.getOrderNumber(), itemsHtml.toString(),
                        BRAND_COLOR, nf.format(order.getTotalAmount()), order.getShippingAddress(),
                        order.getShippingCity(), order.getShippingState(), order.getShippingPincode(), BRAND_COLOR);
    }
}
