package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.JobDTO;
import com.jobportal.Job.Portal.dto.NotificationDTO;
import com.jobportal.Job.Portal.entity.Job;
import com.jobportal.Job.Portal.entity.User;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.entity.Profile;
import com.jobportal.Job.Portal.repository.JobRepository;
import com.jobportal.Job.Portal.repository.ProfileRepository;
import com.jobportal.Job.Portal.repository.UserRepository;
import com.jobportal.Job.Portal.utility.Utilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Optional;

import com.jobportal.Job.Portal.dto.ApplicantDTO;
import com.jobportal.Job.Portal.entity.Applicant;
import com.jobportal.Job.Portal.dto.ApplicationStatus;

@Service("jobService")
public class JobServiceImpl implements JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Override
    public JobDTO postJob(JobDTO jobDTO) throws JobPortalException {

        jobDTO.setId(Utilities.getNextSequence("jobs"));
        jobDTO.setPostTime(LocalDateTime.now());

        Job saved = jobRepository.save(jobDTO.toEntity());

        createCompanyJobPostedNotification(saved);

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

        return withCompanyLogo(saved.toDTO());
    }

    @Override
    public List<JobDTO> getAllJobs() throws JobPortalException {

        return jobRepository
                .findAll()
                .stream()
                .filter(job -> job.getJobStatus() == null || job.getJobStatus() == com.jobportal.Job.Portal.dto.JobStatus.OPEN)
                .map(job -> withCompanyLogo(job.toDTO()))
                .toList();
    }

    @Override
    public JobDTO getJob(Long id) throws JobPortalException {

        return withCompanyLogo(jobRepository.findById(id)
                .orElseThrow(() ->
                        new JobPortalException("JOB_NOT_FOUND"))
                .toDTO());
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

        // ── Auto-populate applicant info from user's profile ──
        User user = null;
        if (applicantId != null) {
            user = userRepository.findById(applicantId).orElse(null);
        }
        if (user == null && applicantDTO.getEmail() != null) {
            user = userRepository.findByEmail(applicantDTO.getEmail()).orElse(null);
        }

        Profile profile = null;
        if (user != null && user.getProfileId() != null) {
            profile = profileRepository.findById(user.getProfileId()).orElse(null);
        }

        // Validate profile completeness
        if (profile != null) {
            if (profile.getPhone() == null || profile.getPhone().isBlank()
                    || profile.getAbout() == null || profile.getAbout().isBlank()
                    || profile.getSkills() == null || profile.getSkills().isEmpty()) {
                throw new JobPortalException("PROFILE_INCOMPLETE");
            }
        } else {
            // No profile at all – treat as incomplete
            throw new JobPortalException("PROFILE_INCOMPLETE");
        }

        // Populate from profile if not already provided
        if (applicantDTO.getName() == null || applicantDTO.getName().isBlank()) {
            applicantDTO.setName(user.getName());
        }
        if (applicantDTO.getEmail() == null || applicantDTO.getEmail().isBlank()) {
            applicantDTO.setEmail(user.getEmail());
        }
        if (applicantDTO.getPhone() == null) {
            try {
                applicantDTO.setPhone(Long.parseLong(profile.getPhone()));
            } catch (NumberFormatException ignored) {}
        }
        if (applicantDTO.getWebsite() == null || applicantDTO.getWebsite().isBlank()) {
            applicantDTO.setWebsite(profile.getPortfolio());
        }
        // Store profileId on the applicant so companies can view full profile
        applicantDTO.setProfileId(profile.getId());

        ApplicationStatus status =
                applicantDTO.getApplicationStatus() != null
                        ? applicantDTO.getApplicationStatus()
                        : ApplicationStatus.APPLIED;

        Applicant applicantRef = new Applicant(
                applicantId,
                profile.getId(),
                applicantDTO.getName(),
                applicantDTO.getEmail(),
                applicantDTO.getPhone(),
                applicantDTO.getWebsite(),
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

        createApplicantAppliedNotification(job, applicantRef);
        createCompanyApplicationNotification(job, applicantRef);
        sendApplicationSubmittedEmail(job, applicantRef);

        return withCompanyLogo(saved.toDTO());
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
        createApplicationStatusNotification(saved, applicant, status);
        sendApplicationStatusEmail(saved, applicant, status);

        return withCompanyLogo(saved.toDTO());
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
                    appliedJobs.add(withCompanyLogo(job.toDTO())));
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
                appliedJobs.add(withCompanyLogo(job.toDTO()));
            }

            if (matchedApplicant && job.getId() != null) {
                repairedInterviewingIds.remove(job.getId());
                repairedOfferedIds.remove(job.getId());

                if (matchedStatus == ApplicationStatus.INTERVIEWING
                        && !repairedInterviewingIds.contains(job.getId())) {
                    repairedInterviewingIds.add(job.getId());
                }

                if (matchedStatus == ApplicationStatus.OFFERED
                        && !repairedOfferedIds.contains(job.getId())) {
                    repairedOfferedIds.add(job.getId());
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

        if (repairedUser) {
            userRepository.save(user);
        }

        return appliedJobs;
    }

    @Override
    public List<JobDTO> getJobsByCompany(String companyName) throws JobPortalException {
        return jobRepository.findByCompany(companyName)
                .stream()
                .map(job -> withCompanyLogo(job.toDTO()))
                .toList();
    }

    @Override
    public List<JobDTO> getMyJobs(String email) throws JobPortalException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));

        Long profileId = user.getProfileId();
        if (profileId == null) {
            return new ArrayList<>();
        }

        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new JobPortalException("PROFILE_NOT_FOUND"));

        String company = profile.getCompany();
        if (company == null || company.isBlank()) {
            return new ArrayList<>();
        }

        return jobRepository.findByCompany(company)
                .stream()
                .map(job -> withCompanyLogo(job.toDTO()))
                .toList();
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

        notifyApplicantsJobClosed(saved);
        sendJobClosedEmails(saved);

        return withCompanyLogo(saved.toDTO());
    }

    private JobDTO withCompanyLogo(JobDTO jobDTO) {
        if (jobDTO == null || jobDTO.getCompany() == null || jobDTO.getCompany().isBlank()) {
            return jobDTO;
        }

        profileRepository.findFirstByCompany(jobDTO.getCompany()).ifPresent(profile -> {
            if (profile.getCompanyLogo() != null) {
                jobDTO.setCompanyLogo(Base64.getEncoder().encodeToString(profile.getCompanyLogo()));
            }
            if (profile.getPicture() != null) {
                jobDTO.setCompanyPicture(Base64.getEncoder().encodeToString(profile.getPicture()));
            }
        });

        return jobDTO;
    }

    private void createApplicantAppliedNotification(Job job, Applicant applicant) {
        Long recipientId = resolveUserId(applicant);
        if (recipientId == null) return;

        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "this job";
        String company = job.getCompany() != null ? job.getCompany() : "the company";

        createNotificationSafe(
                recipientId,
                "Application submitted",
                "Your application for " + jobTitle + " at " + company + " was submitted successfully.",
                "/job-history",
                "APPLICATION"
        );
    }

    private void createCompanyApplicationNotification(Job job, Applicant applicant) {
        if (job.getCompany() == null || job.getCompany().isBlank()) return;

        String applicantName = applicant.getName() != null ? applicant.getName() : "A candidate";
        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "your job";

        for (User user : userRepository.findAll()) {
            if (user.getProfileId() == null) continue;

            Optional<Profile> profile = profileRepository.findById(user.getProfileId());
            if (profile.isPresent()
                    && profile.get().getCompany() != null
                    && profile.get().getCompany().equalsIgnoreCase(job.getCompany())) {
                createNotificationSafe(
                        user.getId(),
                        "New applicant",
                        applicantName + " applied for " + jobTitle + ".",
                        "/posted-job",
                        "HIRING"
                );
            }
        }
    }

    private void createCompanyJobPostedNotification(Job job) {
        if (job.getCompany() == null || job.getCompany().isBlank()) return;

        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "your job";

        for (User user : userRepository.findAll()) {
            if (user.getProfileId() == null) continue;

            Optional<Profile> profile = profileRepository.findById(user.getProfileId());
            if (profile.isPresent()
                    && profile.get().getCompany() != null
                    && profile.get().getCompany().equalsIgnoreCase(job.getCompany())) {
                createNotificationSafe(
                        user.getId(),
                        "Job posted",
                        jobTitle + " is now live and visible to applicants.",
                        "/posted-job",
                        "JOB"
                );
            }
        }
    }

    private void createApplicationStatusNotification(Job job, Applicant applicant, ApplicationStatus status) {
        Long recipientId = resolveUserId(applicant);
        if (recipientId == null) return;

        String company = job.getCompany() != null ? job.getCompany() : "the company";
        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "your application";
        String statusLabel = status.name().toLowerCase().replace("_", " ");

        createNotificationSafe(
                recipientId,
                getStatusEmailSubject(job, status),
                company + " moved " + jobTitle + " to " + statusLabel + ".",
                "/job-history",
                "STATUS"
        );
    }

    private void notifyApplicantsJobClosed(Job job) {
        if (job.getApplicants() == null) return;

        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "a job";
        String company = job.getCompany() != null ? job.getCompany() : "the company";

        for (Applicant applicant : job.getApplicants()) {
            Long recipientId = resolveUserId(applicant);
            if (recipientId == null) continue;

            createNotificationSafe(
                    recipientId,
                    "Job closed",
                    company + " closed " + jobTitle + ". You can still track it in your job history.",
                    "/job-history",
                    "JOB"
            );
        }
    }

    private Long resolveUserId(Applicant applicant) {
        if (applicant == null) return null;
        if (applicant.getApplicantId() != null && userRepository.findById(applicant.getApplicantId()).isPresent()) {
            return applicant.getApplicantId();
        }
        if (applicant.getEmail() == null || applicant.getEmail().isBlank()) return null;
        return userRepository.findByEmail(applicant.getEmail()).map(User::getId).orElse(null);
    }

    private void createNotificationSafe(Long recipientId, String title, String message, String link, String type) {
        try {
            notificationService.createNotification(
                    new NotificationDTO(null, recipientId, title, message, link, LocalDateTime.now(), false, type)
            );
        } catch (Exception e) {
            System.out.println("Failed to create notification: " + e.getMessage());
        }
    }

    private void sendApplicationSubmittedEmail(Job job, Applicant applicant) {
        try {
            if (applicant == null || applicant.getEmail() == null || applicant.getEmail().isBlank()) return;
            emailService.sendApplicationSubmittedEmail(
                    applicant.getEmail(),
                    applicant.getName(),
                    job.getCompany(),
                    job.getJobTitle()
            );
        } catch (Exception e) {
            System.out.println("Failed to send application-submitted email: " + e.getMessage());
        }
    }

    private void sendJobClosedEmails(Job job) {
        if (job.getApplicants() == null) return;

        for (Applicant applicant : job.getApplicants()) {
            try {
                if (applicant.getEmail() == null || applicant.getEmail().isBlank()) continue;
                emailService.sendJobClosedEmail(
                        applicant.getEmail(),
                        applicant.getName(),
                        job.getCompany(),
                        job.getJobTitle()
                );
            } catch (Exception e) {
                System.out.println("Failed to send job-closed email: " + e.getMessage());
            }
        }
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

        if (!user.getAppliedJobs().contains(jobId)) {
            user.getAppliedJobs().add(jobId);
        }

        user.getInterviewingJobs().remove(jobId);
        user.getOfferedJobs().remove(jobId);

        if (status == ApplicationStatus.INTERVIEWING) {
            user.getInterviewingJobs().add(jobId);
        }

        if (status == ApplicationStatus.OFFERED) {
            user.getOfferedJobs().add(jobId);
        }

        userRepository.save(user);
    }

    @Override
    public JobDTO scheduleInterview(
            Long jobId,
            Long applicantId,
            String scheduledAt,
            String meetingLink,
            String notes
    ) throws JobPortalException {

        // First update status to INTERVIEWING
        JobDTO updated = updateApplicationStatus(jobId, applicantId, ApplicationStatus.INTERVIEWING);

        // Find the applicant to get their email and name
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));

        if (job.getApplicants() == null) return updated;

        Applicant applicant = job.getApplicants().stream()
                .filter(a -> applicantId.equals(a.getApplicantId()))
                .findFirst()
                .orElse(null);

        if (applicant == null || applicant.getEmail() == null) return updated;

        try {
            String details = scheduledAt != null ? scheduledAt : "TBD";
            if (meetingLink != null && !meetingLink.isBlank()) {
                details += " | Location: " + meetingLink;
            }
            if (notes != null && !notes.isBlank()) {
                details += " | Details: " + notes;
            }

            emailService.sendInterviewScheduleEmail(
                    applicant.getEmail(),
                    applicant.getName(),
                    job.getCompany(),
                    job.getJobTitle(),
                    details,
                    notes != null ? notes : "Please be available at the scheduled time."
            );

            System.out.println("Interview scheduled email sent to " + applicant.getEmail());
        } catch (Exception e) {
            System.out.println("Failed to send interview schedule email: " + e.getMessage());
        }

        return updated;
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
            String heading = getStatusEmailHeading(status);
            String message = getStatusEmailBody(job, status);

            emailService.sendApplicationStatusEmail(
                    applicant.getEmail(),
                    applicant.getName(),
                    job.getCompany(),
                    job.getJobTitle(),
                    subject,
                    heading,
                    message
            );
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

    private String getStatusEmailHeading(ApplicationStatus status) {
        if (status == ApplicationStatus.INTERVIEWING) return "You have been moved to Interviewing";
        if (status == ApplicationStatus.OFFERED) return "You received an offer";
        if (status == ApplicationStatus.REJECTED) return "Application status update";
        if (status == ApplicationStatus.ACCEPTED) return "Offer accepted";
        if (status == ApplicationStatus.DECLINED) return "Offer declined";
        return "Application Update";
    }

    private String getStatusEmailBody(Job job, ApplicationStatus status) {
        String company = emailService.escapeHtml(job.getCompany() != null ? job.getCompany() : "the company");
        String jobTitle = emailService.escapeHtml(job.getJobTitle() != null ? job.getJobTitle() : "the role");

        String body =
                "There is an update for your application at <b>"
                        + company + "</b>.";

        if (status == ApplicationStatus.INTERVIEWING) {
            body = "Good news. <b>" + company
                    + "</b> moved your application for <b>"
                    + jobTitle
                    + "</b> to the interviewing stage.";
        }

        if (status == ApplicationStatus.OFFERED) {
            body = "Congratulations. <b>" + company
                    + "</b> has offered you the <b>"
                    + jobTitle
                    + "</b> role. Please open Job History and respond from the Offered tab.";
        }

        if (status == ApplicationStatus.REJECTED) {
            body = "<b>" + company
                    + "</b> has updated your application for <b>"
                    + jobTitle
                    + "</b>. Unfortunately, you were not selected for this role.";
        }

        if (status == ApplicationStatus.ACCEPTED) {
            body = "Your acceptance for the <b>"
                    + jobTitle
                    + "</b> role at <b>"
                    + company
                    + "</b> has been saved.";
        }

        if (status == ApplicationStatus.DECLINED) {
            body = "Your decision to decline the <b>"
                    + jobTitle
                    + "</b> offer from <b>"
                    + company
                    + "</b> has been saved.";
        }

        return body;
    }
}
