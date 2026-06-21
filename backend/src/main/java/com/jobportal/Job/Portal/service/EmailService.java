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
                buildStatusBadge("SUCCESS"),
                "Hi " + escapeHtml(defaultValue(name, "there")) + ",",
                "Your JobNexus account has been created successfully. You can now complete your profile, discover roles, and manage your hiring journey.",
                null,
                "Open JobNexus",
                frontendUrl
        );
    }

    public void sendOtpEmail(String toEmail, String name, String otp) {
        sendTemplate(
                toEmail,
                "Your JobNexus OTP code",
                "Reset your password",
                buildStatusBadge("INFO"),
                "Hi " + escapeHtml(defaultValue(name, "there")) + ",",
                "Use this OTP to reset your JobNexus password. The code expires in 5 minutes.",
                null,
                escapeHtml(otp),
                null
        );
    }

    public void sendPasswordChangedEmail(String toEmail, String name) {
        sendTemplate(
                toEmail,
                "Your JobNexus password was changed",
                "Password changed",
                buildStatusBadge("SUCCESS"),
                "Hi " + escapeHtml(defaultValue(name, "there")) + ",",
                "Your JobNexus password was changed successfully. If this was not you, reset your password immediately.",
                null,
                "Open JobNexus",
                frontendUrl
        );
    }

    public void sendInvitationEmail(String toEmail, String candidateName, String companyName, String jobTitle, String jobId) {
        String link = isBlank(jobId) ? frontendUrl : frontendUrl + "/jobs/" + escapeUrl(jobId);
        sendTemplate(
                toEmail,
                "You're invited to apply at " + defaultValue(companyName, "a company"),
                "You're invited",
                buildStatusBadge("INFO"),
                "Hi " + escapeHtml(defaultValue(candidateName, "Candidate")) + ",",
                "<b>" + escapeHtml(defaultValue(companyName, "A company")) + "</b> invited you to apply for <b>" + escapeHtml(defaultValue(jobTitle, "a position")) + "</b>.",
                null,
                "View job",
                link
        );
    }

    public void sendSelectionEmail(String toEmail, String candidateName, String companyName, String role, String roundName, String message) {
        sendTemplate(
                toEmail,
                "You are selected for the next round at " + defaultValue(companyName, "the company"),
                "Congratulations, " + escapeHtml(defaultValue(candidateName, "Candidate")) + "!",
                buildStatusBadge("SUCCESS"),
                "Hi " + escapeHtml(defaultValue(candidateName, "Candidate")) + ",",
                "You have been selected for <b>" + escapeHtml(defaultValue(roundName, "the next round")) + "</b> for <b>" + escapeHtml(defaultValue(role, "the role")) + "</b>.<br/><br/>" + escapeHtml(defaultValue(message, "The hiring team will share the next steps shortly.")),
                buildJobDetails(null, companyName, role, null, null, null),
                "Open JobNexus",
                frontendUrl
        );
    }

    // ── Student emails ──

    public void sendApplicationSubmittedEmail(String toEmail, String candidateName, String companyName, String jobTitle, String location, String experience, String jobType) {
        sendTemplate(
                toEmail,
                "Application submitted for " + defaultValue(jobTitle, "your role"),
                "Application submitted",
                buildStatusBadge("SUCCESS"),
                "Hi " + escapeHtml(defaultValue(candidateName, "there")) + ",",
                "Your application for <b>" + escapeHtml(defaultValue(jobTitle, "the role")) + "</b> at <b>" + escapeHtml(defaultValue(companyName, "the company")) + "</b> was submitted successfully.",
                buildJobDetails(location, companyName, jobTitle, experience, jobType, null),
                "View job history",
                frontendUrl + "/job-history"
        );
    }

    public void sendInterviewScheduleEmail(String toEmail, String candidateName, String companyName, String role, String scheduledAt, String mode, String location, String meetingLink, String notes) {
        String details = "";
        if (!isBlank(scheduledAt)) details += "<tr><td style='padding:6px 12px;border-bottom:1px solid #eee;color:#555;font-size:13px;'>Date &amp; Time</td><td style='padding:6px 12px;border-bottom:1px solid #eee;color:#222;font-size:13px;font-weight:600;'>" + escapeHtml(scheduledAt) + "</td></tr>";
        if (!isBlank(mode)) details += "<tr><td style='padding:6px 12px;border-bottom:1px solid #eee;color:#555;font-size:13px;'>Mode</td><td style='padding:6px 12px;border-bottom:1px solid #eee;color:#222;font-size:13px;font-weight:600;'>" + escapeHtml(mode) + "</td></tr>";
        if (!isBlank(location)) details += "<tr><td style='padding:6px 12px;border-bottom:1px solid #eee;color:#555;font-size:13px;'>Location</td><td style='padding:6px 12px;border-bottom:1px solid #eee;color:#222;font-size:13px;font-weight:600;'>" + escapeHtml(location) + "</td></tr>";
        if (!isBlank(meetingLink)) details += "<tr><td style='padding:6px 12px;border-bottom:1px solid #eee;color:#555;font-size:13px;'>Meeting Link</td><td style='padding:6px 12px;border-bottom:1px solid #eee;color:#222;font-size:13px;font-weight:600;'><a href='" + escapeHtml(meetingLink) + "' style='color:#f99b07;'>" + escapeHtml(meetingLink) + "</a></td></tr>";
        if (!isBlank(notes)) details += "<tr><td style='padding:6px 12px;border-bottom:1px solid #eee;color:#555;font-size:13px;'>Notes</td><td style='padding:6px 12px;border-bottom:1px solid #eee;color:#222;font-size:13px;'>" + escapeHtml(notes) + "</td></tr>";

        String interviewTable = isBlank(details) ? "" :
                "<table style='width:100%;border-collapse:collapse;margin:12px 0;border:1px solid #eee;border-radius:8px;overflow:hidden;'>"
                + details + "</table>";

        sendTemplate(
                toEmail,
                "Interview scheduled at " + defaultValue(companyName, "the company"),
                "Interview scheduled",
                buildStatusBadge("INFO"),
                "Hi " + escapeHtml(defaultValue(candidateName, "Candidate")) + ",",
                "<b>" + escapeHtml(defaultValue(companyName, "The company")) + "</b> scheduled your interview for <b>" + escapeHtml(defaultValue(role, "the role")) + "</b>.",
                interviewTable,
                "View details",
                frontendUrl + "/job-history"
        );
    }

    public void sendApplicationStatusEmail(String toEmail, String candidateName, String companyName, String jobTitle, String subject, String heading, String body, String extraDetails) {
        sendTemplate(
                toEmail,
                subject,
                heading,
                buildStatusBadge(getBadgeForStatus(subject)),
                "Hi " + escapeHtml(defaultValue(candidateName, "Candidate")) + ",",
                body,
                extraDetails,
                "View job history",
                frontendUrl + "/job-history"
        );
    }

    public void sendJobClosedEmail(String toEmail, String candidateName, String companyName, String jobTitle) {
        sendTemplate(
                toEmail,
                "Job closed: " + defaultValue(jobTitle, "your application"),
                "Job closed",
                buildStatusBadge("CLOSED"),
                "Hi " + escapeHtml(defaultValue(candidateName, "there")) + ",",
                "<b>" + escapeHtml(defaultValue(companyName, "The company")) + "</b> closed <b>" + escapeHtml(defaultValue(jobTitle, "the job")) + "</b>. You can still track it in your job history.",
                null,
                "View job history",
                frontendUrl + "/job-history"
        );
    }

    // ── Company emails ──

    public void sendCompanyNewApplicantEmail(String toEmail, String companyName, String candidateName, String jobTitle) {
        sendTemplate(
                toEmail,
                "New applicant for " + defaultValue(jobTitle, "your job"),
                "New application received",
                buildStatusBadge("NEW"),
                "Hi",
                "<b>" + escapeHtml(defaultValue(candidateName, "A candidate")) + "</b> applied for <b>" + escapeHtml(defaultValue(jobTitle, "your job")) + "</b> at <b>" + escapeHtml(defaultValue(companyName, "your company")) + "</b>.",
                null,
                "View applicants",
                frontendUrl + "/posted-job"
        );
    }

    public void sendCompanyApplicantStatusEmail(String toEmail, String companyName, String candidateName, String jobTitle, String statusLabel) {
        String subject = candidateName + " moved to " + statusLabel + " for " + jobTitle;
        String heading = "Application status update";
        String body = "<b>" + escapeHtml(defaultValue(candidateName, "The candidate")) + "</b> has been moved to <b>" + escapeHtml(statusLabel) + "</b> for <b>" + escapeHtml(defaultValue(jobTitle, "the role")) + "</b> at <b>" + escapeHtml(defaultValue(companyName, "your company")) + "</b>.";

        sendTemplate(
                toEmail,
                subject,
                heading,
                buildStatusBadge("UPDATE"),
                "Hi",
                body,
                null,
                "View applicants",
                frontendUrl + "/posted-job"
        );
    }

    // ── Admin emails ──

    public void sendOfferResponseCompanyEmail(String toEmail, String companyName, String candidateName, String jobTitle, boolean accepted) {
        String subject = accepted
                ? candidateName + " accepted your offer for " + jobTitle
                : candidateName + " declined your offer for " + jobTitle;
        String heading = accepted ? "Offer accepted" : "Offer declined";
        String body = accepted
                ? "<b>" + escapeHtml(defaultValue(candidateName, "The candidate")) + "</b> accepted your offer for <b>" + escapeHtml(defaultValue(jobTitle, "the role")) + "</b> at <b>" + escapeHtml(defaultValue(companyName, "your company")) + "</b>."
                : "<b>" + escapeHtml(defaultValue(candidateName, "The candidate")) + "</b> declined your offer for <b>" + escapeHtml(defaultValue(jobTitle, "the role")) + "</b> at <b>" + escapeHtml(defaultValue(companyName, "your company")) + "</b>.";

        sendTemplate(
                toEmail,
                subject,
                heading,
                buildStatusBadge(accepted ? "SUCCESS" : "CLOSED"),
                "Hi",
                body,
                null,
                "View applicants",
                frontendUrl + "/posted-job"
        );
    }

    public void sendCompanyJobClosedEmail(String toEmail, String companyName, String jobTitle) {
        sendTemplate(
                toEmail,
                "Job closed: " + defaultValue(jobTitle, "your job"),
                "Job closed",
                buildStatusBadge("CLOSED"),
                "Hi",
                "<b>" + escapeHtml(defaultValue(jobTitle, "Your job")) + "</b> at <b>" + escapeHtml(defaultValue(companyName, "your company")) + "</b> has been closed. It will no longer appear in job listings.",
                null,
                "View posted jobs",
                frontendUrl + "/posted-job"
        );
    }

    public void sendAdminStatusNotificationEmail(String toEmail, String eventType, String companyName, String candidateName, String jobTitle, String details) {
        String subject = "[Admin] " + eventType + " - " + defaultValue(companyName, "Unknown");
        sendTemplate(
                toEmail,
                subject,
                "Admin notification: " + eventType,
                buildStatusBadge("ADMIN"),
                "Admin notification",
                "<b>Event:</b> " + escapeHtml(defaultValue(eventType, "Status update")) + "<br/>"
                + "<b>Company:</b> " + escapeHtml(defaultValue(companyName, "N/A")) + "<br/>"
                + "<b>Candidate:</b> " + escapeHtml(defaultValue(candidateName, "N/A")) + "<br/>"
                + "<b>Job:</b> " + escapeHtml(defaultValue(jobTitle, "N/A")) + "<br/>"
                + (isBlank(details) ? "" : "<b>Details:</b> " + escapeHtml(details)),
                null,
                "Open admin panel",
                frontendUrl + "/admin"
        );
    }

    public void sendNotificationEmail(String toEmail, String title, String message, String link) {
        sendTemplate(
                toEmail,
                defaultValue(title, "JobNexus notification"),
                defaultValue(title, "JobNexus notification"),
                buildStatusBadge("INFO"),
                "You have a new update.",
                escapeHtml(defaultValue(message, "Open JobNexus to review the latest update.")),
                null,
                isBlank(link) ? "Open JobNexus" : "View update",
                isBlank(link) ? frontendUrl : frontendUrl + link
        );
    }

    private void sendTemplate(String toEmail, String subject, String heading, String badgeHtml, String intro, String body, String extraDetailsHtml, String actionLabel, String actionUrl) {
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
            helper.setText(buildHtml(heading, badgeHtml, intro, body, extraDetailsHtml, actionLabel, actionUrl), true);
            javaMailSender.send(mimeMessage);
        } catch (MailException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new RuntimeException(exception);
        }
    }

    private String buildHtml(String heading, String badgeHtml, String intro, String body, String extraDetailsHtml, String actionLabel, String actionUrl) {
        String action = "";
        if (!isBlank(actionLabel)) {
            if (isBlank(actionUrl)) {
                action = "<div style='display:inline-block;background:#fff6d8;color:#2d2d2d;padding:14px 24px;border-radius:8px;font-size:24px;letter-spacing:4px;font-weight:700;'>" + actionLabel + "</div>";
            } else {
                action = "<a href='" + actionUrl + "' style='display:inline-block;background:#f99b07;color:#111111;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;'>"
                        + escapeHtml(actionLabel) + "</a>";
            }
        }

        String details = isBlank(extraDetailsHtml) ? "" :
                "<div style='margin:16px 0;padding:16px;background:#f8f8fa;border-radius:8px;border:1px solid #eee;'>"
                + extraDetailsHtml + "</div>";

        return "<div style='font-family:Arial,sans-serif;background:#f4f4f5;padding:24px;'>" +
                "<div style='max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e7e7e7;'>" +
                "<div style='font-size:22px;font-weight:800;color:#f99b07;margin-bottom:8px;'>JobNexus</div>" +
                "<div style='height:3px;background:linear-gradient(90deg,#f99b07,#ffb347);margin-bottom:20px;border-radius:2px;'></div>" +
                badgeHtml +
                "<h2 style='margin:12px 0 8px;color:#222222;font-size:20px;'>" + heading + "</h2>" +
                "<p style='color:#454545;line-height:1.6;margin:0 0 12px;font-size:14px;'>" + intro + "</p>" +
                "<p style='color:#454545;line-height:1.6;margin:0 0 16px;font-size:14px;'>" + body + "</p>" +
                details +
                "<div style='margin:20px 0;text-align:center;'>" + action + "</div>" +
                "<p style='color:#888888;font-size:12px;margin-top:20px;padding-top:16px;border-top:1px solid #eee;'>" +
                "Best wishes,<br/><span style='font-weight:600;color:#f99b07;'>JobNexus team</span></p>" +
                "</div></div>";
    }

    private String buildStatusBadge(String type) {
        String bgColor, textColor, label;
        switch (type) {
            case "SUCCESS": bgColor = "#d4edda"; textColor = "#155724"; label = "✓ Success"; break;
            case "INFO": bgColor = "#d1ecf1"; textColor = "#0c5460"; label = "i Info"; break;
            case "CLOSED": bgColor = "#e2e3e5"; textColor = "#383d41"; label = "Closed"; break;
            case "NEW": bgColor = "#cce5ff"; textColor = "#004085"; label = "★ New"; break;
            case "UPDATE": bgColor = "#fff3cd"; textColor = "#856404"; label = "● Update"; break;
            case "ADMIN": bgColor = "#f8d7da"; textColor = "#721c24"; label = "Admin"; break;
            default: bgColor = "#e2e3e5"; textColor = "#383d41"; label = "Info";
        }
        return "<div style='display:inline-block;background:" + bgColor + ";color:" + textColor + ";padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;margin-bottom:4px;'>" + label + "</div>";
    }

    private String buildJobDetails(String location, String company, String jobTitle, String experience, String jobType, String salary) {
        String rows = "";
        if (!isBlank(jobTitle)) rows += "<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Role</td><td style='padding:5px 10px;color:#222;font-size:13px;font-weight:600;'>" + escapeHtml(jobTitle) + "</td></tr>";
        if (!isBlank(company)) rows += "<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Company</td><td style='padding:5px 10px;color:#222;font-size:13px;font-weight:600;'>" + escapeHtml(company) + "</td></tr>";
        if (!isBlank(location)) rows += "<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Location</td><td style='padding:5px 10px;color:#222;font-size:13px;'>" + escapeHtml(location) + "</td></tr>";
        if (!isBlank(experience)) rows += "<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Experience</td><td style='padding:5px 10px;color:#222;font-size:13px;'>" + escapeHtml(experience) + "</td></tr>";
        if (!isBlank(jobType)) rows += "<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Type</td><td style='padding:5px 10px;color:#222;font-size:13px;'>" + escapeHtml(jobType) + "</td></tr>";
        if (!isBlank(salary)) rows += "<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Salary</td><td style='padding:5px 10px;color:#222;font-size:13px;font-weight:600;'>" + escapeHtml(salary) + "</td></tr>";
        return isBlank(rows) ? null :
                "<table style='width:100%;border-collapse:collapse;'>" + rows + "</table>";
    }

    private String getBadgeForStatus(String subject) {
        if (subject == null) return "INFO";
        String s = subject.toLowerCase();
        if (s.contains("accept") || s.contains("congratulations")) return "SUCCESS";
        if (s.contains("declin") || s.contains("reject")) return "CLOSED";
        if (s.contains("interview") || s.contains("offer")) return "INFO";
        return "UPDATE";
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
