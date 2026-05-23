package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.LoginDTO;
import com.jobportal.Job.Portal.dto.ResponseDTO;
import com.jobportal.Job.Portal.dto.UserDTO;
import com.jobportal.Job.Portal.entity.OTP;
import com.jobportal.Job.Portal.entity.User;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.repository.OTPRepository;
import com.jobportal.Job.Portal.repository.UserRepository;
import com.jobportal.Job.Portal.utility.Data;
import com.jobportal.Job.Portal.utility.Utilities;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;


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
    private JavaMailSender javaMailSender;
    @Autowired
    private com.jobportal.Job.Portal.service.NotificationService notificationService;

    @Override
    public UserDTO registerUser(UserDTO userDTO) throws JobPortalException {

//        if(userRepository.existsByEmail(userDTO.getEmail())){
//            throw new RuntimeException("Email already exists");
//        }

        Optional<User> optionalUser= userRepository.findByEmail(userDTO.getEmail());
        if(optionalUser.isPresent())throw new JobPortalException("USER_FOUND");
        userDTO.setProfileId(profileService.createProfile(userDTO.getEmail()));

        userDTO.setId(Utilities.getNextSequence("users"));
        userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        User user =userDTO.toEntity();
        user =userRepository.save(user);
        // create welcome notification
        try {
            com.jobportal.Job.Portal.dto.NotificationDTO n = new com.jobportal.Job.Portal.dto.NotificationDTO(null, user.getId(), "Welcome to JobHook", "Your account has been created successfully.", null, java.time.LocalDateTime.now(), false, "SYSTEM");
            notificationService.createNotification(n);
        } catch (Exception e) {
            System.out.println("Failed to create welcome notification: " + e.getMessage());
        }
        return user.toDTO();
    }

    @Override
    public UserDTO loginUser(LoginDTO loginDTO) throws JobPortalException {
        User user = userRepository.findByEmail(loginDTO.getEmail()).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
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
    }

    @Override
    public boolean sendOtp(String email) throws Exception {
        User user =userRepository.findByEmail(email).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        MimeMessage mimeMessage=javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage,true);
        mimeMessageHelper.setTo(email);
        mimeMessageHelper.setSubject("Your OTP Code");
        String genOtp = Utilities.generateOtp();
        OTP otp = new OTP(email, genOtp, LocalDateTime.now());
        otpRepository.save(otp);
        mimeMessageHelper.setText(Data.getMessageBody(genOtp,user.getName()),true);
        javaMailSender.send(mimeMessage);
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
        return new ResponseDTO("Password Changed Successfully.");
    }

    @Override
    public ResponseDTO sendSelectionEmail(Map<String, String> selectionDetails) throws Exception {
        String toEmail = selectionDetails.get("toEmail");
        if (toEmail == null || toEmail.isBlank()) throw new JobPortalException("EMAIL_NOT_FOUND");

        String candidateName = escapeHtml(selectionDetails.getOrDefault("candidateName", "Candidate"));
        String companyName = escapeHtml(selectionDetails.getOrDefault("companyName", "the company"));
        String role = escapeHtml(selectionDetails.getOrDefault("role", "the role"));
        String roundName = escapeHtml(selectionDetails.getOrDefault("roundName", "next round"));
        String message = escapeHtml(selectionDetails.getOrDefault("message", "Our hiring team will share the next steps shortly."));

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
        helper.setTo(toEmail);
        helper.setSubject("You are selected for the next round at " + companyName);
        helper.setText(
                "<div style='font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;'>" +
                "<div style='max-width:560px;margin:auto;background:#ffffff;border-radius:10px;padding:24px;border:1px solid #e7e7e7;'>" +
                "<h2 style='margin:0 0 12px;color:#2d2d2d;'>Congratulations, " + candidateName + "!</h2>" +
                "<p style='color:#454545;line-height:1.6;'>You have been selected by <b>" + companyName + "</b> for the <b>" + roundName + "</b> round for <b>" + role + "</b>.</p>" +
                "<p style='color:#454545;line-height:1.6;'>" + message + "</p>" +
                "<p style='color:#888888;font-size:13px;margin-top:24px;'>Best wishes,<br/>" + companyName + " hiring team</p>" +
                "</div></div>",
                true
        );
        javaMailSender.send(mimeMessage);
        return new ResponseDTO("Selection email sent successfully.");
    }

    private String escapeHtml(String value) {
        return value == null ? "" : value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
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





