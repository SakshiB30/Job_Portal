package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.LoginDTO;
import com.jobportal.Job.Portal.dto.ResponseDTO;
import com.jobportal.Job.Portal.dto.UserDTO;
import com.jobportal.Job.Portal.dto.AccountType;
import com.jobportal.Job.Portal.entity.OTP;
import com.jobportal.Job.Portal.entity.Profile;
import com.jobportal.Job.Portal.entity.User;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.repository.OTPRepository;
import com.jobportal.Job.Portal.repository.ProfileRepository;
import com.jobportal.Job.Portal.repository.UserRepository;
import com.jobportal.Job.Portal.utility.Utilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;


@Service(value = "userService")
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileService profileService;
    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.jobportal.Job.Portal.service.NotificationService notificationService;

    @Override
    public UserDTO registerUser(UserDTO userDTO) throws JobPortalException {

//        if(userRepository.existsByEmail(userDTO.getEmail())){
//            throw new RuntimeException("Email already exists");
//        }

        Optional<User> optionalUser= userRepository.findByEmail(userDTO.getEmail());
        if(optionalUser.isPresent())throw new JobPortalException("USER_FOUND");
        if (userDTO.getAccountType() == AccountType.ADMIN) throw new JobPortalException("ADMIN_REGISTER_NOT_ALLOWED");
        if (userDTO.getAccountType() == null) userDTO.setAccountType(AccountType.APPLICANT);
        userDTO.setBlocked(false);
        if (userDTO.getAccountType() == AccountType.EMPLOYER) {
            userDTO.setCompanyStatus("PENDING");
        } else {
            userDTO.setCompanyStatus("APPROVED");
        }
        userDTO.setProfileId(profileService.createProfile(userDTO.getEmail()));

        userDTO.setId(Utilities.getNextSequence("users"));
        userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        User user =userDTO.toEntity();
        user =userRepository.save(user);
        try {
            com.jobportal.Job.Portal.dto.NotificationDTO n = new com.jobportal.Job.Portal.dto.NotificationDTO(null, user.getId(), "Welcome to JobNexus", "Your account has been created successfully.", null, java.time.LocalDateTime.now(), false, "SYSTEM");
            notificationService.createNotification(n);
        } catch (Exception e) {
            System.out.println("Failed to create welcome notification: " + e.getMessage());
        }
        // Welcome email — fire and forget so signup response is instant
        CompletableFuture.runAsync(() -> {
            try {
                emailService.sendWelcomeEmail(user.getEmail(), user.getName());
            } catch (Exception e) {
                System.out.println("Failed to send welcome email: " + e.getMessage());
            }
        });
        return user.toDTO();
    }

    @Override
    public UserDTO loginUser(LoginDTO loginDTO) throws JobPortalException {
        User user = userRepository.findByEmail(loginDTO.getEmail()).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        if(Boolean.TRUE.equals(user.getBlocked())) throw new JobPortalException("ACCOUNT_BLOCKED");
        if(user.getPassword() == null) throw new JobPortalException("INVALID_CREDENTIALS");
        if(!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) throw new JobPortalException("INVALID_CREDENTIALS");
        return user.toDTO();
    }

    @Override
    public UserDTO getUserById(Long id) throws JobPortalException {
        User user = userRepository.findById(id).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        ensureLists(user);
        return user.toDTO();
    }

    @Override
    public UserDTO toggleSavedJob(Long userId, Long jobId) throws JobPortalException {
        User user = userRepository.findById(userId).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        ensureLists(user);
        if (user.getSavedJobs().contains(jobId)) {
            user.getSavedJobs().remove(jobId);
        } else {
            user.getSavedJobs().add(jobId);
        }
        userRepository.save(user);
        return user.toDTO();
    }

    @Override
    public UserDTO toggleLikedJob(Long userId, Long jobId) throws JobPortalException {
        User user = userRepository.findById(userId).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        ensureLists(user);
        if (user.getLikedJobs().contains(jobId)) {
            user.getLikedJobs().remove(jobId);
        } else {
            user.getLikedJobs().add(jobId);
        }
        userRepository.save(user);
        return user.toDTO();
    }

    @Override
    public UserDTO markInterviewingJob(Long userId, Long jobId) throws JobPortalException {
        User user = userRepository.findById(userId).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        ensureLists(user);
        if (!user.getInterviewingJobs().contains(jobId)) {
            user.getInterviewingJobs().add(jobId);
        }
        if (!user.getAppliedJobs().contains(jobId)) {
            user.getAppliedJobs().add(jobId);
        }
        userRepository.save(user);
        return user.toDTO();
    }

    @Override
    public UserDTO markOfferedJob(Long userId, Long jobId) throws JobPortalException {
        User user = userRepository.findById(userId).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        ensureLists(user);
        if (!user.getOfferedJobs().contains(jobId)) {
            user.getOfferedJobs().add(jobId);
        }
        if (!user.getAppliedJobs().contains(jobId)) {
            user.getAppliedJobs().add(jobId);
        }
        userRepository.save(user);
        return user.toDTO();
    }

    private void ensureLists(User user) {
        if (user.getSavedJobs() == null) user.setSavedJobs(new ArrayList<>());
        if (user.getLikedJobs() == null) user.setLikedJobs(new ArrayList<>());
        if (user.getAppliedJobs() == null) user.setAppliedJobs(new ArrayList<>());
        if (user.getInterviewingJobs() == null) user.setInterviewingJobs(new ArrayList<>());
        if (user.getOfferedJobs() == null) user.setOfferedJobs(new ArrayList<>());
        if (user.getFollowing() == null) user.setFollowing(new ArrayList<>());
    }

    @Override
    public boolean sendOtp(String email) throws Exception {
        User user =userRepository.findByEmail(email).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        String genOtp = Utilities.generateOtp();
        OTP otp = new OTP(email, genOtp, LocalDateTime.now());
        otpRepository.save(otp);

        try {
            emailService.sendOtpEmail(email, user.getName(), genOtp);
        } catch (Exception e) {
            System.out.println("OTP ERROR:");
            e.printStackTrace();
            throw new JobPortalException("OTP_SEND_FAILED");
        }

        return true;
    }

    @Override
    public boolean verifyOtp(String email, String otp) throws JobPortalException {
        OTP otpEntity = otpRepository.findById(email).orElseThrow(()-> new JobPortalException("OTP_NOT_FOUND"));
        if(!otpEntity.getOtpCode().equals(otp))throw new JobPortalException("OTP_INCORRECT");
        return true;
    }

    @Override
    public ResponseDTO changePassword(LoginDTO loginDTO) throws JobPortalException {
        User user =userRepository.findByEmail(loginDTO.getEmail()).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        user.setPassword(passwordEncoder.encode(loginDTO.getPassword()));
        userRepository.save(user);
        try {
            com.jobportal.Job.Portal.dto.NotificationDTO n = new com.jobportal.Job.Portal.dto.NotificationDTO(null, user.getId(), "Password changed", "Your account password was changed successfully.", null, java.time.LocalDateTime.now(), false, "SECURITY");
            notificationService.createNotification(n);
        } catch (Exception e) {
            System.out.println("Failed to create password-change notification: " + e.getMessage());
        }
        try {
            emailService.sendPasswordChangedEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            System.out.println("Failed to send password-change email: " + e.getMessage());
        }
        return new ResponseDTO("Password Changed Successfully.");
    }

    @Override
    public ResponseDTO sendInvitationEmail(Map<String, String> invitationDetails) throws Exception {
        String toEmail = invitationDetails.get("toEmail");
        if (toEmail == null || toEmail.isBlank()) throw new JobPortalException("EMAIL_NOT_FOUND");

        emailService.sendInvitationEmail(
                toEmail,
                invitationDetails.getOrDefault("candidateName", "Candidate"),
                invitationDetails.getOrDefault("companyName", "a company"),
                invitationDetails.getOrDefault("jobTitle", "a position"),
                invitationDetails.getOrDefault("jobId", "")
        );

        // Send in-app notification to the invited candidate
        userRepository.findByEmail(toEmail).ifPresent(user -> {
            try {
                notificationService.createNotification(
                        new com.jobportal.Job.Portal.dto.NotificationDTO(
                                null,
                                user.getId(),
                                "You've been invited",
                                invitationDetails.getOrDefault("companyName", "A company") + " invited you to apply for " + invitationDetails.getOrDefault("jobTitle", "a position") + ".",
                                "/find-jobs",
                                java.time.LocalDateTime.now(),
                                false,
                                "HIRING"
                        )
                );
            } catch (Exception e) {
                System.out.println("Failed to create invitation notification: " + e.getMessage());
            }
        });

        return new ResponseDTO("Invitation email sent successfully.");
    }

    @Override
    public ResponseDTO sendSelectionEmail(Map<String, String> selectionDetails) throws Exception {
        String toEmail = selectionDetails.get("toEmail");
        if (toEmail == null || toEmail.isBlank()) throw new JobPortalException("EMAIL_NOT_FOUND");

        emailService.sendSelectionEmail(
                toEmail,
                selectionDetails.getOrDefault("candidateName", "Candidate"),
                selectionDetails.getOrDefault("companyName", "the company"),
                selectionDetails.getOrDefault("role", "the role"),
                selectionDetails.getOrDefault("roundName", "next round"),
                selectionDetails.getOrDefault("message", "Our hiring team will share the next steps shortly.")
        );

        // Send in-app notification to the selected candidate
        userRepository.findByEmail(toEmail).ifPresent(user -> {
            try {
                notificationService.createNotification(
                        new com.jobportal.Job.Portal.dto.NotificationDTO(
                                null,
                                user.getId(),
                                "Application update",
                                "You have been selected for " + selectionDetails.getOrDefault("roundName", "the next round") + " for " + selectionDetails.getOrDefault("role", "the role") + " at " + selectionDetails.getOrDefault("companyName", "the company") + ".",
                                "/job-history",
                                java.time.LocalDateTime.now(),
                                false,
                                "STATUS"
                        )
                );
            } catch (Exception e) {
                System.out.println("Failed to create selection notification: " + e.getMessage());
            }
        });

        return new ResponseDTO("Selection email sent successfully.");
    }

    @Override
    public ResponseDTO sendInterviewEmail(Map<String, String> interviewDetails) throws Exception {
        String toEmail = interviewDetails.get("toEmail");
        if (toEmail == null || toEmail.isBlank()) throw new JobPortalException("EMAIL_NOT_FOUND");

        emailService.sendInterviewScheduleEmail(
                toEmail,
                interviewDetails.getOrDefault("candidateName", "Candidate"),
                interviewDetails.getOrDefault("companyName", "the company"),
                interviewDetails.getOrDefault("role", "the role"),
                interviewDetails.getOrDefault("scheduledAt", "the selected date"),
                interviewDetails.getOrDefault("mode", ""),
                interviewDetails.getOrDefault("location", ""),
                interviewDetails.getOrDefault("meetingLink", ""),
                interviewDetails.getOrDefault("message", "Please be available at the scheduled time.")
        );

        // Send in-app notification to the interviewed candidate
        userRepository.findByEmail(toEmail).ifPresent(user -> {
            try {
                notificationService.createNotification(
                        new com.jobportal.Job.Portal.dto.NotificationDTO(
                                null,
                                user.getId(),
                                "Interview scheduled",
                                "Your interview for " + interviewDetails.getOrDefault("role", "the role") + " at " + interviewDetails.getOrDefault("companyName", "the company") + " has been scheduled for " + interviewDetails.getOrDefault("scheduledAt", "the selected date") + ".",
                                "/job-history",
                                java.time.LocalDateTime.now(),
                                false,
                                "STATUS"
                        )
                );
            } catch (Exception e) {
                System.out.println("Failed to create interview notification: " + e.getMessage());
            }
        });

        return new ResponseDTO("Interview email sent successfully.");
    }

    @Override
    public UserDTO followProfile(Long userId, Long profileId) throws JobPortalException {
        User user = userRepository.findById(userId).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        ensureLists(user);
        if (!user.getFollowing().contains(profileId)) {
            user.getFollowing().add(profileId);
            userRepository.save(user);
            // Increment follower count on the profile
            Profile profile = profileRepository.findById(profileId).orElseThrow(() -> new JobPortalException("PROFILE_NOT_FOUND"));
            if (profile.getFollowerCount() == null) profile.setFollowerCount(0);
            profile.setFollowerCount(profile.getFollowerCount() + 1);
            profileRepository.save(profile);
        }
        return user.toDTO();
    }

    @Override
    public UserDTO unfollowProfile(Long userId, Long profileId) throws JobPortalException {
        User user = userRepository.findById(userId).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        ensureLists(user);
        if (user.getFollowing().contains(profileId)) {
            user.getFollowing().remove(profileId);
            userRepository.save(user);
            // Decrement follower count on the profile
            Profile profile = profileRepository.findById(profileId).orElseThrow(() -> new JobPortalException("PROFILE_NOT_FOUND"));
            if (profile.getFollowerCount() != null && profile.getFollowerCount() > 0) {
                profile.setFollowerCount(profile.getFollowerCount() - 1);
            }
            profileRepository.save(profile);
        }
        return user.toDTO();
    }

    @Override
    public List<com.jobportal.Job.Portal.dto.ProfileDTO> getFollowing(Long userId) throws JobPortalException {
        User user = userRepository.findById(userId).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        ensureLists(user);
        List<Long> followingIds = user.getFollowing();
        if (followingIds.isEmpty()) {
            return new ArrayList<>();
        }
        return profileService.getProfilesByIds(followingIds);
    }

    @Scheduled(fixedRate = 60000)
    public void removeExpiredOTPs(){
        LocalDateTime expiry= LocalDateTime.now().minusMinutes(5);
        List<OTP>expiredOTPs=otpRepository.findByCreationTimeBefore(expiry);
        if(!expiredOTPs.isEmpty()){
            otpRepository.deleteAll(expiredOTPs);
            System.out.println("Removed "+expiredOTPs.size()+" expired OTPs");
        }

    }


}




