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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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

        List<JobDTO> jobDTOs = jobRepository
                .findAll()
                .stream()
                .filter(job -> job.getJobStatus() == null || job.getJobStatus() == com.jobportal.Job.Portal.dto.JobStatus.OPEN)
                .map(job -> {
                    JobDTO dto = job.toDTO();
                    // Strip full applicant data from listing — only send the count
                    // The frontend already handles `applicants` being either an array or a number
                    int applicantCount = dto.getApplicants() != null ? dto.getApplicants().size() : 0;
                    dto.setApplicants(null);
                    dto.setApplicantCount(applicantCount);
                    return dto;
                })
                .toList();

        // Batch-attach logos in a single query instead of N+1
        return batchAttachLogos(jobDTOs);
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
                    || profile.getSkills() == null || profile.getSkills().isEmpty()
                    || profile.getResume() == null || profile.getResume().length == 0) {
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

        // Pass resume from profile to applicant
        byte[] profileResumeBytes = profile.getResume();
        if (profileResumeBytes != null && profileResumeBytes.length > 0) {
            // Validate that the resume is a PDF (magic bytes: %PDF = 25 50 44 46)
            if (profileResumeBytes.length < 4 ||
                profileResumeBytes[0] != 0x25 ||
                profileResumeBytes[1] != 0x50 ||
                profileResumeBytes[2] != 0x44 ||
                profileResumeBytes[3] != 0x46) {
                throw new JobPortalException("RESUME_NOT_PDF");
            }
        }
        String resumeBase64 = profileResumeBytes != null
                ? Base64.getEncoder().encodeToString(profileResumeBytes)
                : null;

        Applicant applicantRef = new Applicant(
                applicantId,
                profile.getId(),
                applicantDTO.getName(),
                applicantDTO.getEmail(),
                applicantDTO.getPhone(),
                applicantDTO.getWebsite(),
                applicantDTO.getCoverLetter(),
                resumeBase64,
                LocalDateTime.now(),
                status,
                null, // interviewDate
                null, // interviewMode
                null, // interviewMeetingLink
                null, // interviewNotes
                null, // interviewDateTime
                null  // reminderSent
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
        sendCompanyNewApplicantEmail(job, applicantRef);
        sendAdminStatusNotification(job, applicantRef, ApplicationStatus.APPLIED);

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

        // Notify company for status changes (offer responses have dedicated tailored notifications)
        if (status == ApplicationStatus.ACCEPTED || status == ApplicationStatus.DECLINED) {
            createCompanyOfferResponseNotification(saved, applicant, status);
            sendCompanyOfferResponseEmail(saved, applicant, status);
        } else {
            createCompanyApplicationStatusNotification(saved, applicant, status);
            sendCompanyApplicationStatusEmail(saved, applicant, status);
        }

        // Notify admin for key status changes
        sendAdminStatusNotification(saved, applicant, status);

        return withCompanyLogo(saved.toDTO());
    }

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

        // Also check interviewing and offered job IDs to catch any jobs not in applied list
        Set<Long> allJobIds = new HashSet<>(appliedJobIds);
        if (user.getInterviewingJobs() != null) allJobIds.addAll(user.getInterviewingJobs());
        if (user.getOfferedJobs() != null) allJobIds.addAll(user.getOfferedJobs());

        List<JobDTO> appliedJobs = new ArrayList<>();
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

        // Only fetch the jobs the user is associated with — NOT all jobs in the database
        for (Long jobId : allJobIds) {
            Optional<Job> optionalJob = jobRepository.findById(jobId);
            if (optionalJob.isEmpty()) continue;

            Job job = optionalJob.get();
            JobDTO dto = withCompanyLogo(job.toDTO());

            // Keep full applicant data in appliedJobs so the frontend can extract status/interview details
            appliedJobs.add(dto);

            if (!repairedAppliedIds.contains(jobId)) {
                repairedAppliedIds.add(jobId);
                repairedUser = true;
            }

            // Scan this job's applicants for status reconciliation
            if (job.getApplicants() != null) {
                boolean matchedApplicant = false;
                boolean repairedApplicantId = false;
                ApplicationStatus matchedStatus = ApplicationStatus.APPLIED;

                for (Applicant applicant : job.getApplicants()) {
                    boolean matchedById = applicant.getApplicantId() != null
                            && applicant.getApplicantId().equals(userId);
                    boolean matchedByEmail = applicant.getEmail() != null
                            && user.getEmail() != null
                            && applicant.getEmail().equalsIgnoreCase(user.getEmail());

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

                if (matchedApplicant) {
                    repairedInterviewingIds.remove(jobId);
                    repairedOfferedIds.remove(jobId);

                    if (matchedStatus == ApplicationStatus.INTERVIEWING
                            && !repairedInterviewingIds.contains(jobId)) {
                        repairedInterviewingIds.add(jobId);
                        repairedUser = true;
                    }

                    if (matchedStatus == ApplicationStatus.OFFERED
                            && !repairedOfferedIds.contains(jobId)) {
                        repairedOfferedIds.add(jobId);
                        repairedUser = true;
                    }
                }

                if (repairedApplicantId) {
                    jobRepository.save(job);
                }
            }
        }

        // Limit the number of save operations by only saving if changes were detected
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

        // Use the same company name resolution as getEmployerCompanyName
        String company = profile.getCompany();
        if (company == null || company.isBlank()) {
            // Fall back to user's name (consistent with job posting)
            company = user.getName();
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
        sendCompanyJobClosedNotification(saved);
        sendCompanyJobClosedEmail(saved);
        sendAdminJobClosedNotification(saved);

        return withCompanyLogo(saved.toDTO());
    }

    /**
     * Batch-load company logos for a list of jobs in a single query,
     * then attach them to each job DTO. This eliminates the N+1 query problem.
     */
    private List<JobDTO> batchAttachLogos(List<JobDTO> jobDTOs) {
        if (jobDTOs == null || jobDTOs.isEmpty()) return jobDTOs;

        // Collect unique company names
        Set<String> companyNames = jobDTOs.stream()
                .map(JobDTO::getCompany)
                .filter(c -> c != null && !c.isBlank())
                .collect(Collectors.toSet());

        if (companyNames.isEmpty()) return jobDTOs;

        // Batch-load all company profiles in one query
        List<Profile> profiles = profileRepository.findByCompanyIn(companyNames);
        Map<String, Profile> logoMap = new HashMap<>();
        for (Profile p : profiles) {
            // Use the first profile found per company (avoid overwriting)
            logoMap.putIfAbsent(p.getCompany(), p);
        }

        // Attach logos to each job
        for (JobDTO dto : jobDTOs) {
            if (dto.getCompany() == null) continue;
            Profile profile = logoMap.get(dto.getCompany());
            if (profile != null) {
                if (profile.getCompanyLogo() != null) {
                    dto.setCompanyLogo(Base64.getEncoder().encodeToString(profile.getCompanyLogo()));
                }
                if (profile.getPicture() != null) {
                    dto.setCompanyPicture(Base64.getEncoder().encodeToString(profile.getPicture()));
                }
            }
        }

        return jobDTOs;
    }

    /**
     * Single-job version (used by getJob / scheduleInterview where only one DTO is returned).
     */
    private JobDTO withCompanyLogo(JobDTO jobDTO) {
        if (jobDTO == null || jobDTO.getCompany() == null || jobDTO.getCompany().isBlank()) {
            return jobDTO;
        }
        List<JobDTO> result = batchAttachLogos(List.of(jobDTO));
        return result.isEmpty() ? jobDTO : result.get(0);
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

        for (User user : getCompanyUsers(job.getCompany())) {
            createNotificationSafe(
                    user.getId(),
                    "New applicant",
                    applicantName + " applied for " + jobTitle + ".",
                    "/posted-job",
                    "HIRING"
            );
        }
    }

    private void createCompanyJobPostedNotification(Job job) {
        if (job.getCompany() == null || job.getCompany().isBlank()) return;

        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "your job";

        for (User user : getCompanyUsers(job.getCompany())) {
            createNotificationSafe(
                    user.getId(),
                    "Job posted",
                    jobTitle + " is now live and visible to applicants.",
                    "/posted-job",
                    "JOB"
            );
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
                    job.getJobTitle(),
                    job.getLocation(),
                    job.getExperience(),
                    job.getJobType()
            );
        } catch (Exception e) {
            System.out.println("Failed to send application-submitted email: " + e.getMessage());
        }
    }

    private void sendCompanyNewApplicantEmail(Job job, Applicant applicant) {
        if (job.getCompany() == null || job.getCompany().isBlank()) return;
        for (User user : getCompanyUsers(job.getCompany())) {
            if (user.getEmail() == null) continue;
            try {
                emailService.sendCompanyNewApplicantEmail(
                        user.getEmail(),
                        job.getCompany(),
                        applicant.getName(),
                        job.getJobTitle()
                );
            } catch (Exception e) {
                System.out.println("Failed to send company new applicant email: " + e.getMessage());
            }
        }
    }

    private void createCompanyOfferResponseNotification(Job job, Applicant applicant, ApplicationStatus status) {
        if (job.getCompany() == null || job.getCompany().isBlank()) return;

        String applicantName = applicant.getName() != null ? applicant.getName() : "The candidate";
        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "your job";
        boolean accepted = status == ApplicationStatus.ACCEPTED;

        String title = accepted ? "Offer accepted" : "Offer declined";
        String message = accepted
                ? applicantName + " accepted your offer for " + jobTitle + "."
                : applicantName + " declined your offer for " + jobTitle + ".";

        for (User user : getCompanyUsers(job.getCompany())) {
            createNotificationSafe(
                    user.getId(),
                    title,
                    message,
                    "/posted-job",
                    "HIRING"
            );
        }
    }

    private void sendCompanyOfferResponseEmail(Job job, Applicant applicant, ApplicationStatus status) {
        if (job.getCompany() == null || job.getCompany().isBlank()) return;

        String applicantName = applicant.getName() != null ? applicant.getName() : "A candidate";
        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "a role";
        boolean accepted = status == ApplicationStatus.ACCEPTED;

        for (User user : getCompanyUsers(job.getCompany())) {
            if (user.getEmail() == null) continue;
            try {
                emailService.sendOfferResponseCompanyEmail(
                        user.getEmail(),
                        job.getCompany(),
                        applicantName,
                        jobTitle,
                        accepted
                );
                System.out.println("Offer response email sent to " + user.getEmail());
            } catch (Exception e) {
                System.out.println("Failed to send offer response email: " + e.getMessage());
            }
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

    /**
     * Find users whose profile's company matches the given company name.
     * Avoids loading ALL users from the database and iterating in memory.
     */
    private List<User> getCompanyUsers(String companyName) {
        if (companyName == null || companyName.isBlank()) return List.of();
        List<Profile> profiles = profileRepository.findByCompanyIgnoreCase(companyName);
        if (profiles == null || profiles.isEmpty()) return List.of();
        List<Long> profileIds = profiles.stream()
                .map(Profile::getId)
                .toList();
        return userRepository.findByProfileIdIn(profileIds);
    }

    /**
     * Find all admin users. Avoids loading ALL users from the database.
     */
    private List<User> getAdminUsers() {
        return userRepository.findByAccountType(com.jobportal.Job.Portal.dto.AccountType.ADMIN);
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

        // Validate that scheduledAt is a valid date/time and is in the future
        if (scheduledAt == null || scheduledAt.isBlank()) {
            throw new JobPortalException("Interview date and time is required");
        }

        String formattedDate = scheduledAt;
        LocalDateTime interviewDateTime = null;
        try {
            // Parse ISO format (e.g. 2026-04-15T14:00) and validate it's in the future
            interviewDateTime = LocalDateTime.parse(scheduledAt);
            if (interviewDateTime.isBefore(LocalDateTime.now())) {
                throw new JobPortalException("Interview must be scheduled in the future");
            }
            // Format to a human-readable string for storage and display
            java.time.format.DateTimeFormatter formatter =
                java.time.format.DateTimeFormatter.ofPattern("MMMM d, yyyy 'at' h:mm a");
            formattedDate = interviewDateTime.format(formatter);
        } catch (java.time.format.DateTimeParseException e) {
            // If parsing fails, use the value as-is (it may already be human-readable)
        }

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

        String mode = (meetingLink != null && (meetingLink.startsWith("http") || meetingLink.startsWith("https")))
                ? "Online"
                : (meetingLink != null && !meetingLink.isBlank()) ? "In-person" : "";

        // Store interview details on the applicant (use formatted date)
        applicant.setInterviewDate(formattedDate);
        applicant.setInterviewMode(mode);
        applicant.setInterviewMeetingLink(meetingLink);
        applicant.setInterviewNotes(notes);
        applicant.setInterviewDateTime(interviewDateTime);
        applicant.setReminderSent(false);
        jobRepository.save(job);

        // Send interview confirmation email
        try {
            emailService.sendInterviewScheduleEmail(
                    applicant.getEmail(),
                    applicant.getName(),
                    job.getCompany(),
                    job.getJobTitle(),
                    formattedDate,
                    mode,
                    !mode.equals("Online") && meetingLink != null ? meetingLink : null,
                    mode.equals("Online") ? meetingLink : null,
                    notes
            );
            System.out.println("Interview scheduled email sent to " + applicant.getEmail());
        } catch (Exception e) {
            System.out.println("Failed to send interview schedule email: " + e.getMessage());
        }

        // Send in-app notification with interview details
        Long recipientId = resolveUserId(applicant);
        if (recipientId != null) {
            String companyName = job.getCompany() != null ? job.getCompany() : "the company";
            String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "the role";
            StringBuilder details = new StringBuilder();
            details.append("Scheduled: ").append(formattedDate);
            if (mode != null && !mode.isBlank()) details.append(" | Mode: ").append(mode);
            if (meetingLink != null && !meetingLink.isBlank()) details.append(" | Link: ").append(meetingLink);
            if (notes != null && !notes.isBlank()) details.append(" | Notes: ").append(notes);

            createNotificationSafe(
                    recipientId,
                    "Interview scheduled at " + companyName,
                    "Your interview for " + jobTitle + " at " + companyName + " has been scheduled.\n" + details.toString(),
                    "/job-history",
                    "INTERVIEW"
            );
        }

        return updated;
    }

    /**
     * Every 30 minutes, scan all jobs for upcoming interviews and send reminder emails
     * to applicants whose interview is within the next 24 hours.
     */
    @Scheduled(fixedRate = 1800000)
    public void sendInterviewReminders() {
        try {
            List<Job> allJobs = jobRepository.findAll();
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime reminderWindow = now.plusHours(24);
            int reminderCount = 0;

            for (Job job : allJobs) {
                if (job.getApplicants() == null) continue;

                for (Applicant applicant : job.getApplicants()) {
                    // Only process INTERVIEWING applicants with a scheduled date
                    if (applicant.getApplicationStatus() != ApplicationStatus.INTERVIEWING) continue;
                    if (applicant.getInterviewDateTime() == null) continue;
                    if (Boolean.TRUE.equals(applicant.getReminderSent())) continue;
                    if (applicant.getEmail() == null || applicant.getEmail().isBlank()) continue;

                    LocalDateTime interviewTime = applicant.getInterviewDateTime();

                    // Send reminder if interview is within the next 24 hours
                    if (interviewTime.isAfter(now) && interviewTime.isBefore(reminderWindow)) {
                        String mode = applicant.getInterviewMode() != null ? applicant.getInterviewMode() : "";
                        String meetingLink = applicant.getInterviewMeetingLink();

                        emailService.sendInterviewReminderEmail(
                                applicant.getEmail(),
                                applicant.getName(),
                                job.getCompany(),
                                job.getJobTitle(),
                                applicant.getInterviewDate(),
                                mode,
                                meetingLink
                        );

                        applicant.setReminderSent(true);
                        reminderCount++;
                    }
                }

                if (reminderCount > 0) {
                    jobRepository.save(job);
                }
            }

            if (reminderCount > 0) {
                System.out.println("Sent " + reminderCount + " interview reminder(s)");
            }
        } catch (Exception e) {
            System.out.println("Failed to send interview reminders: " + e.getMessage());
        }
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
            String extraDetails = buildStatusEmailDetails(job, status);

            emailService.sendApplicationStatusEmail(
                    applicant.getEmail(),
                    applicant.getName(),
                    job.getCompany(),
                    job.getJobTitle(),
                    subject,
                    heading,
                    message,
                    extraDetails
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

    private void createCompanyApplicationStatusNotification(Job job, Applicant applicant, ApplicationStatus status) {
        if (job.getCompany() == null || job.getCompany().isBlank()) return;
        String applicantName = applicant.getName() != null ? applicant.getName() : "A candidate";
        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "a job";
        String statusLabel = status.name().toLowerCase().replace("_", " ");

        for (User user : getCompanyUsers(job.getCompany())) {
            createNotificationSafe(
                    user.getId(),
                    "Application " + statusLabel,
                    applicantName + " for " + jobTitle + " moved to " + statusLabel + ".",
                    "/posted-job",
                    "HIRING"
            );
        }
    }

    private void sendCompanyApplicationStatusEmail(Job job, Applicant applicant, ApplicationStatus status) {
        if (job.getCompany() == null || job.getCompany().isBlank()) return;
        String applicantName = applicant.getName() != null ? applicant.getName() : "A candidate";
        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "a role";
        String statusLabel = status.name().toLowerCase().replace("_", " ");

        for (User user : getCompanyUsers(job.getCompany())) {
            if (user.getEmail() == null) continue;
            try {
                emailService.sendCompanyApplicantStatusEmail(
                        user.getEmail(),
                        job.getCompany(),
                        applicantName,
                        jobTitle,
                        statusLabel
                );
            } catch (Exception e) {
                System.out.println("Failed to send company status email: " + e.getMessage());
            }
        }
    }

    private void sendAdminStatusNotification(Job job, Applicant applicant, ApplicationStatus status) {
        String statusLabel = status.name().toLowerCase().replace("_", " ");
        String eventType = "Application " + statusLabel;
        String details = "Job ID: " + job.getId() + " | Applicant ID: " + applicant.getApplicantId();

        for (User user : getAdminUsers()) {
            if (user.getEmail() == null) continue;
            try {
                emailService.sendAdminStatusNotificationEmail(
                        user.getEmail(),
                        eventType,
                        job.getCompany(),
                        applicant.getName(),
                        job.getJobTitle(),
                        details
                );
            } catch (Exception e) {
                System.out.println("Failed to send admin notification: " + e.getMessage());
            }
        }
    }

    private void sendCompanyJobClosedNotification(Job job) {
        if (job.getCompany() == null || job.getCompany().isBlank()) return;
        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "your job";

        for (User user : getCompanyUsers(job.getCompany())) {
            createNotificationSafe(
                    user.getId(),
                    "Job closed",
                    jobTitle + " has been closed. It will no longer appear in job listings.",
                    "/posted-job",
                    "JOB"
            );
        }
    }

    private void sendCompanyJobClosedEmail(Job job) {
        if (job.getCompany() == null || job.getCompany().isBlank()) return;
        for (User user : getCompanyUsers(job.getCompany())) {
            if (user.getEmail() == null) continue;
            try {
                emailService.sendCompanyJobClosedEmail(
                        user.getEmail(),
                        job.getCompany(),
                        job.getJobTitle()
                );
            } catch (Exception e) {
                System.out.println("Failed to send company job-closed email: " + e.getMessage());
            }
        }
    }

    private void sendAdminJobClosedNotification(Job job) {
        for (User user : getAdminUsers()) {
            if (user.getEmail() == null) continue;
            try {
                emailService.sendAdminStatusNotificationEmail(
                        user.getEmail(),
                        "Job closed",
                        job.getCompany(),
                        null,
                        job.getJobTitle(),
                        "Job ID: " + job.getId()
                );
            } catch (Exception e) {
                System.out.println("Failed to send admin job closed notification: " + e.getMessage());
            }
        }
    }

    private String buildStatusEmailDetails(Job job, ApplicationStatus status) {
        StringBuilder details = new StringBuilder();
        if (job.getJobTitle() != null) details.append("<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Role</td><td style='padding:5px 10px;color:#222;font-size:13px;font-weight:600;'>").append(emailService.escapeHtml(job.getJobTitle())).append("</td></tr>");
        if (job.getCompany() != null) details.append("<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Company</td><td style='padding:5px 10px;color:#222;font-size:13px;font-weight:600;'>").append(emailService.escapeHtml(job.getCompany())).append("</td></tr>");
        if (job.getLocation() != null) details.append("<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Location</td><td style='padding:5px 10px;color:#222;font-size:13px;'>").append(emailService.escapeHtml(job.getLocation())).append("</td></tr>");
        if (job.getJobType() != null) details.append("<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Type</td><td style='padding:5px 10px;color:#222;font-size:13px;'>").append(emailService.escapeHtml(job.getJobType())).append("</td></tr>");
        if (job.getExperience() != null) details.append("<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Experience</td><td style='padding:5px 10px;color:#222;font-size:13px;'>").append(emailService.escapeHtml(job.getExperience())).append("</td></tr>");
        if (job.getPackageOffered() != null) details.append("<tr><td style='padding:5px 10px;color:#666;font-size:12px;'>Salary</td><td style='padding:5px 10px;color:#222;font-size:13px;font-weight:600;'>₹ ").append(job.getPackageOffered()).append(" LPA</td></tr>");

        String table = details.toString();
        if (table.isEmpty()) return null;
        return "<table style='width:100%;border-collapse:collapse;'>" + table + "</table>";
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
