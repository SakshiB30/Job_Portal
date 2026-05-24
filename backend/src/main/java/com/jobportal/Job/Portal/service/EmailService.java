package com.jobportal.Job.Portal.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public void sendWelcomeEmail(String toEmail, String name) {
        sendTemplate(
                toEmail,
                "Welcome to JobNexus",
                "Welcome to JobNexus",
                "Hi " + escapeHtml(defaultValue(name, "there")) + ",",
                "Your JobNexus account has been created successfully. You can now complete your profile, discover roles, and manage your hiring journey.",
                "Open JobNexus",
                frontendUrl
        );
    }

    public void sendOtpEmail(String toEmail, String name, String otp) {
        sendTemplate(
                toEmail,
                "Your JobNexus OTP code",
                "Reset your password",
                "Hi " + escapeHtml(defaultValue(name, "there")) + ",",
                "Use this OTP to reset your JobNexus password. The code expires in 5 minutes.",
                escapeHtml(otp),
                null
        );
    }

    public void sendPasswordChangedEmail(String toEmail, String name) {
        sendTemplate(
                toEmail,
                "Your JobNexus password was changed",
                "Password changed",
                "Hi " + escapeHtml(defaultValue(name, "there")) + ",",
                "Your JobNexus password was changed successfully. If this was not you, reset your password immediately.",
                "Open JobNexus",
                frontendUrl
        );
    }

    public void sendInvitationEmail(String toEmail, String candidateName, String companyName, String jobTitle, String jobId) {
        String link = isBlank(jobId) ? frontendUrl : frontendUrl + "/apply-job/" + escapeUrl(jobId);
        sendTemplate(
                toEmail,
                "You're invited to apply at " + defaultValue(companyName, "a company"),
                "You're invited",
                "Hi " + escapeHtml(defaultValue(candidateName, "Candidate")) + ",",
                "<b>" + escapeHtml(defaultValue(companyName, "A company")) + "</b> invited you to apply for <b>" + escapeHtml(defaultValue(jobTitle, "a position")) + "</b>.",
                "View job",
                link
        );
    }

    public void sendSelectionEmail(String toEmail, String candidateName, String companyName, String role, String roundName, String message) {
        sendTemplate(
                toEmail,
                "You are selected for the next round at " + defaultValue(companyName, "the company"),
                "Congratulations, " + escapeHtml(defaultValue(candidateName, "Candidate")) + "!",
                "Good news from " + escapeHtml(defaultValue(companyName, "the company")) + ".",
                "You have been selected for <b>" + escapeHtml(defaultValue(roundName, "the next round")) + "</b> for <b>" + escapeHtml(defaultValue(role, "the role")) + "</b>.<br/><br/>" + escapeHtml(defaultValue(message, "The hiring team will share the next steps shortly.")),
                "Open JobNexus",
                frontendUrl
        );
    }

    public void sendInterviewScheduleEmail(String toEmail, String candidateName, String companyName, String role, String scheduledAt, String message) {
        sendTemplate(
                toEmail,
                "Interview scheduled at " + defaultValue(companyName, "the company"),
                "Interview scheduled",
                "Hi " + escapeHtml(defaultValue(candidateName, "Candidate")) + ",",
                "<b>" + escapeHtml(defaultValue(companyName, "The company")) + "</b> scheduled your interview for <b>" + escapeHtml(defaultValue(role, "the role")) + "</b> on <b>" + escapeHtml(defaultValue(scheduledAt, "the selected date")) + "</b>.<br/><br/>" + escapeHtml(defaultValue(message, "Please be available at the scheduled time.")),
                "Open JobNexus",
                frontendUrl
        );
    }

    public void sendApplicationSubmittedEmail(String toEmail, String candidateName, String companyName, String jobTitle) {
        sendTemplate(
                toEmail,
                "Application submitted for " + defaultValue(jobTitle, "your role"),
                "Application submitted",
                "Hi " + escapeHtml(defaultValue(candidateName, "there")) + ",",
                "Your application for <b>" + escapeHtml(defaultValue(jobTitle, "the role")) + "</b> at <b>" + escapeHtml(defaultValue(companyName, "the company")) + "</b> was submitted successfully.",
                "View job history",
                frontendUrl + "/job-history"
        );
    }

    public void sendApplicationStatusEmail(String toEmail, String candidateName, String companyName, String jobTitle, String subject, String heading, String body) {
        sendTemplate(
                toEmail,
                subject,
                heading,
                "Hi " + escapeHtml(defaultValue(candidateName, "Candidate")) + ",",
                body,
                "View job history",
                frontendUrl + "/job-history"
        );
    }

    public void sendJobClosedEmail(String toEmail, String candidateName, String companyName, String jobTitle) {
        sendTemplate(
                toEmail,
                "Job closed: " + defaultValue(jobTitle, "your application"),
                "Job closed",
                "Hi " + escapeHtml(defaultValue(candidateName, "there")) + ",",
                "<b>" + escapeHtml(defaultValue(companyName, "The company")) + "</b> closed <b>" + escapeHtml(defaultValue(jobTitle, "the job")) + "</b>. You can still track it in your job history.",
                "View job history",
                frontendUrl + "/job-history"
        );
    }

    public void sendNotificationEmail(String toEmail, String title, String message, String link) {
        sendTemplate(
                toEmail,
                defaultValue(title, "JobNexus notification"),
                defaultValue(title, "JobNexus notification"),
                "You have a new update.",
                escapeHtml(defaultValue(message, "Open JobNexus to review the latest update.")),
                isBlank(link) ? "Open JobNexus" : "View update",
                isBlank(link) ? frontendUrl : frontendUrl + link
        );
    }

    private void sendTemplate(String toEmail, String subject, String heading, String intro, String body, String actionLabel, String actionUrl) {
        if (isBlank(toEmail)) return;

        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(toEmail);
            if (!isBlank(mailUsername)) {
                helper.setFrom(mailUsername);
                helper.setReplyTo(mailUsername);
            }
            helper.setSubject(subject);
            helper.setText(buildHtml(heading, intro, body, actionLabel, actionUrl), true);
            javaMailSender.send(mimeMessage);
        } catch (MailException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new RuntimeException(exception);
        }
    }

    private String buildHtml(String heading, String intro, String body, String actionLabel, String actionUrl) {
        String action = "";
        if (!isBlank(actionLabel)) {
            if (isBlank(actionUrl)) {
                action = "<div style='display:inline-block;background:#fff6d8;color:#2d2d2d;padding:14px 24px;border-radius:8px;font-size:24px;letter-spacing:4px;font-weight:700;'>" + actionLabel + "</div>";
            } else {
                action = "<a href='" + actionUrl + "' style='display:inline-block;background:#f99b07;color:#111111;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;'>"
                        + escapeHtml(actionLabel) + "</a>";
            }
        }

        return "<div style='font-family:Arial,sans-serif;background:#f4f4f5;padding:24px;'>" +
                "<div style='max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e7e7e7;'>" +
                "<div style='font-size:22px;font-weight:800;color:#f99b07;margin-bottom:18px;'>JobNexus</div>" +
                "<h2 style='margin:0 0 12px;color:#222222;'>" + heading + "</h2>" +
                "<p style='color:#454545;line-height:1.6;margin:0 0 12px;'>" + intro + "</p>" +
                "<p style='color:#454545;line-height:1.6;margin:0 0 22px;'>" + body + "</p>" +
                "<div style='margin:22px 0;text-align:center;'>" + action + "</div>" +
                "<p style='color:#888888;font-size:13px;margin-top:24px;'>Best wishes,<br/>JobNexus team</p>" +
                "</div></div>";
    }

    private String defaultValue(String value, String fallback) {
        return isBlank(value) ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String escapeUrl(String value) {
        return value == null ? "" : value.replace(" ", "%20");
    }

    public String escapeHtml(String value) {
        return value == null ? "" : value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
