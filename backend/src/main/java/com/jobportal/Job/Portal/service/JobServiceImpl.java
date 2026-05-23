package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.JobDTO;
import com.jobportal.Job.Portal.entity.Job;
import com.jobportal.Job.Portal.entity.User;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.repository.JobRepository;
import com.jobportal.Job.Portal.repository.UserRepository;
import com.jobportal.Job.Portal.utility.Utilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

import com.jobportal.Job.Portal.dto.ApplicantDTO;
import com.jobportal.Job.Portal.entity.Applicant;
import com.jobportal.Job.Portal.dto.ApplicationStatus;

import jakarta.mail.internet.MimeMessage;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service("jobService")
public class JobServiceImpl implements JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Override
    public JobDTO postJob(JobDTO jobDTO) throws JobPortalException {

        jobDTO.setId(Utilities.getNextSequence("jobs"));
        jobDTO.setPostTime(LocalDateTime.now());

        Job saved = jobRepository.save(jobDTO.toEntity());

        try {
            String title = "New job posted: " + saved.getJobTitle();

            String message =
                    "A new job at " + saved.getCompany()
                            + " was posted. Check it out.";

            String link = "/jobs/" + saved.getId();

            notificationService.notifyUsersByAccountType(
                    com.jobportal.Job.Portal.dto.AccountType.APPLICANT,
                    title,
                    message,
                    link
            );

        } catch (Exception e) {

            System.out.println(
                    "Failed to send new-job notifications: "
                            + e.getMessage()
            );
        }

        return saved.toDTO();
    }

    @Override
    public List<JobDTO> getAllJobs() throws JobPortalException {

        return jobRepository
                .findAll()
                .stream()
                .map(Job::toDTO)
                .toList();
    }

    @Override
    public JobDTO getJob(Long id) throws JobPortalException {

        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new JobPortalException("JOB_NOT_FOUND"))
                .toDTO();
    }

    @Override
    public JobDTO applyToJob(
            Long id,
            ApplicantDTO applicantDTO
    ) throws JobPortalException {

        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new JobPortalException("JOB_NOT_FOUND"));

        if (job.getApplicants() == null) {
            job.setApplicants(new ArrayList<>());
        }

        Long applicantId = resolveApplicantId(applicantDTO);
        applicantDTO.setApplicantId(applicantId);

        // CHECK ALREADY APPLIED
        boolean alreadyApplied = job.getApplicants()
                .stream()
                .anyMatch(a ->
                        (applicantId != null
                                && applicantId.equals(a.getApplicantId()))
                                || (a.getEmail() != null
                                && applicantDTO.getEmail() != null
                                && a.getEmail().equalsIgnoreCase(applicantDTO.getEmail())));

        if (alreadyApplied) {
            throw new JobPortalException("ALREADY_APPLIED");
        }

        ApplicationStatus status =
                applicantDTO.getApplicationStatus() != null
                        ? applicantDTO.getApplicationStatus()
                        : ApplicationStatus.APPLIED;

        byte[] resumeBytes = null;

        if (applicantDTO.getResume() != null) {

            try {

                resumeBytes = Base64.getDecoder()
                        .decode(applicantDTO.getResume());

            } catch (IllegalArgumentException e) {

                resumeBytes = null;
            }
        }

        Applicant applicantRef = new Applicant(
                applicantId,
                applicantDTO.getName(),
                applicantDTO.getEmail(),
                applicantDTO.getPhone(),
                applicantDTO.getWebsite(),
                resumeBytes,
                applicantDTO.getCoverLetter(),
                LocalDateTime.now(),
                status
        );

        job.getApplicants().add(applicantRef);

        Job saved = jobRepository.save(job);

        updateUserJobStatus(
                applicantDTO.getEmail(),
                id,
                status
        );

        return saved.toDTO();
    }

    @Override
    public JobDTO updateApplicationStatus(
            Long jobId,
            Long applicantId,
            ApplicationStatus status
    ) throws JobPortalException {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new JobPortalException("JOB_NOT_FOUND"));

        if (job.getApplicants() == null
                || job.getApplicants().isEmpty()) {

            throw new JobPortalException("APPLICANT_NOT_FOUND");
        }

        Applicant applicant = job.getApplicants()
                .stream()
                .filter(item ->
                        applicantId.equals(item.getApplicantId()))
                .findFirst()
                .orElseThrow(() ->
                        new JobPortalException("APPLICANT_NOT_FOUND"));

        applicant.setApplicationStatus(status);

        Job saved = jobRepository.save(job);

        updateUserJobStatus(applicantId, jobId, status);
        updateUserJobStatus(applicant.getEmail(), jobId, status);
        sendApplicationStatusEmail(saved, applicant, status);

        return saved.toDTO();
    }

    // NEW METHOD
    @Override
    public List<JobDTO> getAppliedJobs(Long userId)
            throws JobPortalException {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new JobPortalException("USER_NOT_FOUND"));

        List<Long> appliedJobIds = user.getAppliedJobs();

        if (appliedJobIds == null) {
            appliedJobIds = new ArrayList<>();
            user.setAppliedJobs(appliedJobIds);
        }

        List<JobDTO> appliedJobs = new ArrayList<>();

        for (Long jobId : appliedJobIds) {

            Optional<Job> optionalJob =
                    jobRepository.findById(jobId);

            optionalJob.ifPresent(job ->
                    appliedJobs.add(job.toDTO()));
        }

        List<Long> repairedAppliedIds = new ArrayList<>(appliedJobIds);
        List<Long> repairedInterviewingIds =
                user.getInterviewingJobs() != null
                        ? new ArrayList<>(user.getInterviewingJobs())
                        : new ArrayList<>();
        List<Long> repairedOfferedIds =
                user.getOfferedJobs() != null
                        ? new ArrayList<>(user.getOfferedJobs())
                        : new ArrayList<>();
        List<Long> repairedRejectedIds =
                user.getRejectedJobs() != null
                        ? new ArrayList<>(user.getRejectedJobs())
                        : new ArrayList<>();
        List<Long> repairedAcceptedIds =
                user.getAcceptedJobs() != null
                        ? new ArrayList<>(user.getAcceptedJobs())
                        : new ArrayList<>();
        List<Long> repairedDeclinedIds =
                user.getDeclinedJobs() != null
                        ? new ArrayList<>(user.getDeclinedJobs())
                        : new ArrayList<>();
        boolean repairedUser = false;

        for (Job job : jobRepository.findAll()) {

            if (job.getApplicants() == null) continue;

            boolean matchedApplicant = false;
            boolean repairedApplicantId = false;
            ApplicationStatus matchedStatus = ApplicationStatus.APPLIED;

            for (Applicant applicant : job.getApplicants()) {

                boolean matchedById =
                        applicant.getApplicantId() != null
                                && applicant.getApplicantId().equals(userId);

                boolean matchedByEmail =
                        applicant.getEmail() != null
                                && user.getEmail() != null
                                && applicant.getEmail()
                                .equalsIgnoreCase(user.getEmail());

                if (matchedByEmail && applicant.getApplicantId() == null) {
                    applicant.setApplicantId(userId);
                    repairedApplicantId = true;
                }

                if (matchedById || matchedByEmail) {
                    matchedApplicant = true;
                    matchedStatus = applicant.getApplicationStatus() != null
                            ? applicant.getApplicationStatus()
                            : ApplicationStatus.APPLIED;
                }
            }

            if (matchedApplicant
                    && job.getId() != null
                    && !repairedAppliedIds.contains(job.getId())) {

                repairedAppliedIds.add(job.getId());
                appliedJobs.add(job.toDTO());
            }

            if (matchedApplicant && job.getId() != null) {
                repairedInterviewingIds.remove(job.getId());
                repairedOfferedIds.remove(job.getId());
                repairedRejectedIds.remove(job.getId());
                repairedAcceptedIds.remove(job.getId());
                repairedDeclinedIds.remove(job.getId());

                if (matchedStatus == ApplicationStatus.INTERVIEWING
                        && !repairedInterviewingIds.contains(job.getId())) {
                    repairedInterviewingIds.add(job.getId());
                }

                if (matchedStatus == ApplicationStatus.OFFERED
                        && !repairedOfferedIds.contains(job.getId())) {
                    repairedOfferedIds.add(job.getId());
                }

                if (matchedStatus == ApplicationStatus.REJECTED
                        && !repairedRejectedIds.contains(job.getId())) {
                    repairedRejectedIds.add(job.getId());
                }

                if (matchedStatus == ApplicationStatus.ACCEPTED
                        && !repairedAcceptedIds.contains(job.getId())) {
                    repairedAcceptedIds.add(job.getId());
                }

                if (matchedStatus == ApplicationStatus.DECLINED
                        && !repairedDeclinedIds.contains(job.getId())) {
                    repairedDeclinedIds.add(job.getId());
                }

                repairedUser = true;
            }

            if (matchedApplicant && repairedApplicantId) {
                jobRepository.save(job);
            }
        }

        if (!repairedAppliedIds.equals(appliedJobIds)) {
            user.setAppliedJobs(repairedAppliedIds);
            repairedUser = true;
        }

        if (!repairedInterviewingIds.equals(user.getInterviewingJobs())) {
            user.setInterviewingJobs(repairedInterviewingIds);
            repairedUser = true;
        }

        if (!repairedOfferedIds.equals(user.getOfferedJobs())) {
            user.setOfferedJobs(repairedOfferedIds);
            repairedUser = true;
        }

        if (!repairedRejectedIds.equals(user.getRejectedJobs())) {
            user.setRejectedJobs(repairedRejectedIds);
            repairedUser = true;
        }

        if (!repairedAcceptedIds.equals(user.getAcceptedJobs())) {
            user.setAcceptedJobs(repairedAcceptedIds);
            repairedUser = true;
        }

        if (!repairedDeclinedIds.equals(user.getDeclinedJobs())) {
            user.setDeclinedJobs(repairedDeclinedIds);
            repairedUser = true;
        }

        if (repairedUser) {
            userRepository.save(user);
        }

        return appliedJobs;
    }

    @Override
    public void deleteJob(Long id) throws JobPortalException {

        try {

            jobRepository.deleteById(id);

        } catch (Exception e) {

            throw new JobPortalException(
                    "FAILED_TO_DELETE_JOB"
            );
        }
    }

    @Override
    public JobDTO closeJob(Long id) throws JobPortalException {

        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new JobPortalException("JOB_NOT_FOUND"));

        job.setJobStatus(
                com.jobportal.Job.Portal.dto.JobStatus.CLOSED
        );

        Job saved = jobRepository.save(job);

        return saved.toDTO();
    }

    private void updateUserJobStatus(
            String email,
            Long jobId,
            ApplicationStatus status
    ) {

        if (email == null) return;

        Optional<User> optionalUser =
                userRepository.findByEmail(email);

        optionalUser.ifPresent(user ->
                updateUserJobStatus(user, jobId, status));
    }

    private Long resolveApplicantId(ApplicantDTO applicantDTO) throws JobPortalException {

        if (applicantDTO.getApplicantId() != null) {
            return applicantDTO.getApplicantId();
        }

        if (applicantDTO.getEmail() != null) {

            Optional<User> optionalUser =
                    userRepository.findByEmail(applicantDTO.getEmail());

            if (optionalUser.isPresent()) {
                return optionalUser.get().getId();
            }
        }

        return Utilities.getNextSequence("applicants");
    }

    private void updateUserJobStatus(
            Long applicantId,
            Long jobId,
            ApplicationStatus status
    ) {

        if (applicantId == null) return;

        Optional<User> optionalUser =
                userRepository.findById(applicantId);

        optionalUser.ifPresent(user ->
                updateUserJobStatus(user, jobId, status));
    }

    private void updateUserJobStatus(
            User user,
            Long jobId,
            ApplicationStatus status
    ) {

        if (user.getAppliedJobs() == null)
            user.setAppliedJobs(new ArrayList<>());

        if (user.getInterviewingJobs() == null)
            user.setInterviewingJobs(new ArrayList<>());

        if (user.getOfferedJobs() == null)
            user.setOfferedJobs(new ArrayList<>());

        if (user.getRejectedJobs() == null)
            user.setRejectedJobs(new ArrayList<>());

        if (user.getAcceptedJobs() == null)
            user.setAcceptedJobs(new ArrayList<>());

        if (user.getDeclinedJobs() == null)
            user.setDeclinedJobs(new ArrayList<>());

        if (!user.getAppliedJobs().contains(jobId)) {
            user.getAppliedJobs().add(jobId);
        }

        user.getInterviewingJobs().remove(jobId);
        user.getOfferedJobs().remove(jobId);
        user.getRejectedJobs().remove(jobId);
        user.getAcceptedJobs().remove(jobId);
        user.getDeclinedJobs().remove(jobId);

        if (status == ApplicationStatus.INTERVIEWING) {
            user.getInterviewingJobs().add(jobId);
        }

        if (status == ApplicationStatus.OFFERED) {
            user.getOfferedJobs().add(jobId);
        }

        if (status == ApplicationStatus.REJECTED) {
            user.getRejectedJobs().add(jobId);
        }

        if (status == ApplicationStatus.ACCEPTED) {
            user.getAcceptedJobs().add(jobId);
        }

        if (status == ApplicationStatus.DECLINED) {
            user.getDeclinedJobs().add(jobId);
        }

        userRepository.save(user);
    }

    private void sendApplicationStatusEmail(
            Job job,
            Applicant applicant,
            ApplicationStatus status
    ) {

        if (applicant == null
                || applicant.getEmail() == null
                || applicant.getEmail().isBlank()) {
            return;
        }

        try {
            String subject = getStatusEmailSubject(job, status);
            String message = getStatusEmailMessage(job, applicant, status);

            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(mimeMessage, true);

            helper.setTo(applicant.getEmail());
            if (mailUsername != null && !mailUsername.isBlank()) {
                helper.setFrom(mailUsername);
                helper.setReplyTo(mailUsername);
            }
            helper.setSubject(subject);
            helper.setText(message, true);

            javaMailSender.send(mimeMessage);
            System.out.println(
                    "Application status email sent to "
                            + applicant.getEmail()
                            + " for status "
                            + status
            );

        } catch (Exception e) {
            System.out.println(
                    "Failed to send application status email: "
                            + e.getMessage()
            );
        }
    }

    private String getStatusEmailSubject(
            Job job,
            ApplicationStatus status
    ) {

        String company = job.getCompany() != null
                ? job.getCompany()
                : "the company";

        if (status == ApplicationStatus.INTERVIEWING) {
            return "Interview update from " + company;
        }

        if (status == ApplicationStatus.OFFERED) {
            return "Offer update from " + company;
        }

        if (status == ApplicationStatus.REJECTED) {
            return "Application update from " + company;
        }

        if (status == ApplicationStatus.ACCEPTED) {
            return "Offer acceptance saved";
        }

        if (status == ApplicationStatus.DECLINED) {
            return "Offer response saved";
        }

        return "Application update from " + company;
    }

    private String getStatusEmailMessage(
            Job job,
            Applicant applicant,
            ApplicationStatus status
    ) {

        String applicantName = escapeHtml(
                applicant.getName() != null ? applicant.getName() : "Candidate"
        );
        String company = escapeHtml(
                job.getCompany() != null ? job.getCompany() : "the company"
        );
        String jobTitle = escapeHtml(
                job.getJobTitle() != null ? job.getJobTitle() : "the role"
        );

        String heading = "Application Update";
        String body =
                "There is an update for your application at <b>"
                        + company + "</b>.";

        if (status == ApplicationStatus.INTERVIEWING) {
            heading = "You have been moved to Interviewing";
            body = "Good news. <b>" + company
                    + "</b> moved your application for <b>"
                    + jobTitle
                    + "</b> to the interviewing stage.";
        }

        if (status == ApplicationStatus.OFFERED) {
            heading = "You received an offer";
            body = "Congratulations. <b>" + company
                    + "</b> has offered you the <b>"
                    + jobTitle
                    + "</b> role. Please open Job History and respond from the Offered tab.";
        }

        if (status == ApplicationStatus.REJECTED) {
            heading = "Application status update";
            body = "<b>" + company
                    + "</b> has updated your application for <b>"
                    + jobTitle
                    + "</b>. Unfortunately, you were not selected for this role.";
        }

        if (status == ApplicationStatus.ACCEPTED) {
            heading = "Offer accepted";
            body = "Your acceptance for the <b>"
                    + jobTitle
                    + "</b> role at <b>"
                    + company
                    + "</b> has been saved.";
        }

        if (status == ApplicationStatus.DECLINED) {
            heading = "Offer declined";
            body = "Your decision to decline the <b>"
                    + jobTitle
                    + "</b> offer from <b>"
                    + company
                    + "</b> has been saved.";
        }

        return "<div style='font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;'>" +
                "<div style='max-width:560px;margin:auto;background:#ffffff;border-radius:10px;padding:24px;border:1px solid #e7e7e7;'>" +
                "<h2 style='margin:0 0 12px;color:#2d2d2d;'>"
                + heading
                + "</h2>" +
                "<p style='color:#454545;line-height:1.6;'>Hi "
                + applicantName
                + ",</p>" +
                "<p style='color:#454545;line-height:1.6;'>"
                + body
                + "</p>" +
                "<p style='color:#888888;font-size:13px;margin-top:24px;'>Best wishes,<br/>JobHook team</p>" +
                "</div></div>";
    }

    private String escapeHtml(String value) {
        return value == null ? "" : value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
