package com.jobportal.Job.Portal.security;

import com.jobportal.Job.Portal.dto.AccountType;
import com.jobportal.Job.Portal.dto.ProfileDTO;
import com.jobportal.Job.Portal.entity.Job;
import com.jobportal.Job.Portal.entity.Profile;
import com.jobportal.Job.Portal.entity.User;
import com.jobportal.Job.Portal.repository.JobRepository;
import com.jobportal.Job.Portal.repository.ProfileRepository;
import com.jobportal.Job.Portal.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("authz")
public class AuthorizationService {
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final JobRepository jobRepository;

    public AuthorizationService(UserRepository userRepository, ProfileRepository profileRepository, JobRepository jobRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.jobRepository = jobRepository;
    }

    public boolean isSelfOrAdmin(Long userId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return user != null && (user.getAccountType() == AccountType.ADMIN || user.getId().equals(userId));
    }

    public boolean isOwnProfileOrAdmin(Long profileId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return user != null && (user.getAccountType() == AccountType.ADMIN || profileId.equals(user.getProfileId()));
    }

    public boolean canUpdateProfile(ProfileDTO profileDTO, Authentication authentication) {
        if (profileDTO == null || profileDTO.getId() == null) return false;
        return isOwnProfileOrAdmin(profileDTO.getId(), authentication);
    }

    public boolean canApply(Long applicantId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return user != null && user.getAccountType() == AccountType.APPLICANT && user.getId().equals(applicantId);
    }

    /** Check that the authenticated employer is APPROVED (company verified). */
    public boolean isCompanyVerified(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return false;
        if (user.getAccountType() == AccountType.ADMIN) return true;
        if (user.getAccountType() != AccountType.EMPLOYER) return false;
        return "APPROVED".equals(user.getCompanyStatus());
    }

    public boolean canManageJob(Long jobId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return false;
        if (user.getAccountType() == AccountType.ADMIN) return true;
        if (user.getAccountType() != AccountType.EMPLOYER) return false;
        if (!"APPROVED".equals(user.getCompanyStatus())) return false;
        Job job = jobRepository.findById(jobId).orElse(null);
        Profile profile = user.getProfileId() == null ? null : profileRepository.findById(user.getProfileId()).orElse(null);
        String companyName = profile != null && profile.getCompany() != null ? profile.getCompany() : user.getName();
        return job != null && job.getCompany() != null && job.getCompany().equalsIgnoreCase(companyName);
    }

    public boolean canUpdateApplicationStatus(Long jobId, Long applicantId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return false;
        if (user.getAccountType() == AccountType.ADMIN) return true;
        if (user.getAccountType() == AccountType.EMPLOYER) {
            if (!"APPROVED".equals(user.getCompanyStatus())) return false;
            Job job = jobRepository.findById(jobId).orElse(null);
            Profile profile = user.getProfileId() == null ? null : profileRepository.findById(user.getProfileId()).orElse(null);
            String companyName = profile != null && profile.getCompany() != null ? profile.getCompany() : user.getName();
            return job != null && job.getCompany() != null && job.getCompany().equalsIgnoreCase(companyName);
        }
        if (user.getAccountType() == AccountType.APPLICANT) {
            return user.getId().equals(applicantId);
        }
        return false;
    }

    public boolean canViewUserProfile(Long userId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return false;
        if (user.getAccountType() == AccountType.ADMIN) return true;
        if (user.getId().equals(userId)) return true;
        if (user.getAccountType() == AccountType.EMPLOYER) return true;
        return false;
    }

    public String getEmployerCompanyName(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return null;
        Profile profile = user.getProfileId() == null ? null : profileRepository.findById(user.getProfileId()).orElse(null);
        if (profile != null && profile.getCompany() != null && !profile.getCompany().isBlank()) {
            return profile.getCompany();
        }
        return user.getName();
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return null;
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }
}
