package com.jobportal.Job.Portal.service;


import com.jobportal.Job.Portal.dto.ProfileDTO;
import com.jobportal.Job.Portal.dto.NotificationDTO;
import com.jobportal.Job.Portal.dto.AccountType;
import com.jobportal.Job.Portal.entity.Profile;
import com.jobportal.Job.Portal.entity.User;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.repository.ProfileRepository;
import com.jobportal.Job.Portal.repository.UserRepository;
import com.jobportal.Job.Portal.utility.Utilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("profileService")
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public ProfileServiceImpl(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }


    @Override
    public Long createProfile(String email) throws JobPortalException {
        Profile profile = new Profile();
        profile.setId(Utilities.getNextSequence("profiles"));
        profile.setEmail(email);
        profile.setSkills(new ArrayList<>());
        profile.setExperiences(new ArrayList<>());
        profile.setCertifications(new ArrayList<>());
        profile.setEducation(new ArrayList<>());
        profile.setProjects(new ArrayList<>());
        profile.setAchievements(new ArrayList<>());
        profile.setSpecialties(new ArrayList<>());
        profile.setFollowerCount(0);
        profileRepository.save(profile);
        return profile.getId();
    }

    @Override
    public ProfileDTO getProfile(Long id) throws JobPortalException {
        return profileRepository.findById(id).orElseThrow(()->new JobPortalException("PROFILE_NOT_FOUND")).toDTO();
    }

    @Override
    public ProfileDTO updateProfile(ProfileDTO profileDTO) throws JobPortalException {
        Profile existing = profileRepository.findById(profileDTO.getId())
                .orElseThrow(() -> new JobPortalException("PROFILE_NOT_FOUND"));

        // Merge: only update fields that are explicitly provided in the DTO
        // This prevents partial saves from wiping out fields managed by other sections
        if (profileDTO.getEmail() != null) existing.setEmail(profileDTO.getEmail());
        if (profileDTO.getJobTitle() != null) existing.setJobTitle(profileDTO.getJobTitle());
        if (profileDTO.getCompany() != null) existing.setCompany(profileDTO.getCompany());
        if (profileDTO.getLocation() != null) existing.setLocation(profileDTO.getLocation());
        if (profileDTO.getAbout() != null) existing.setAbout(profileDTO.getAbout());
        if (profileDTO.getBanner() != null && !profileDTO.getBanner().isBlank()) existing.setBanner(Base64.getDecoder().decode(profileDTO.getBanner()));
        if (profileDTO.getPicture() != null && !profileDTO.getPicture().isBlank()) existing.setPicture(Base64.getDecoder().decode(profileDTO.getPicture()));
        if (profileDTO.getPhone() != null) {
            String phone = profileDTO.getPhone().trim();
            // Validate phone number: must contain 7-15 digits, allow +, spaces, hyphens, parentheses
            String cleaned = phone.replaceAll("[^\\d]", "");
            if (cleaned.length() < 7 || cleaned.length() > 15) {
                throw new JobPortalException("Phone number must contain between 7 and 15 digits");
            }
            if (!phone.matches("^[+]?[\\d\\s()\\-]{7,20}$")) {
                throw new JobPortalException("Phone number contains invalid characters. Use digits, spaces, hyphens, parentheses, or a leading +.");
            }
            existing.setPhone(phone);
        }
        if (profileDTO.getPortfolio() != null) existing.setPortfolio(profileDTO.getPortfolio());
        if (profileDTO.getResumeHeadline() != null) existing.setResumeHeadline(profileDTO.getResumeHeadline());
        if (profileDTO.getEducation() != null) existing.setEducation(profileDTO.getEducation());
        if (profileDTO.getProjects() != null) existing.setProjects(profileDTO.getProjects());
        if (profileDTO.getAchievements() != null) existing.setAchievements(profileDTO.getAchievements());
        if (profileDTO.getSkills() != null) existing.setSkills(profileDTO.getSkills());
        if (profileDTO.getExperiences() != null) existing.setExperiences(profileDTO.getExperiences());
        if (profileDTO.getCertifications() != null) existing.setCertifications(profileDTO.getCertifications());
        if (profileDTO.getResume() != null) {
            if (profileDTO.getResume().isBlank()) {
                existing.setResume(null);
            } else {
                byte[] resumeBytes = Base64.getDecoder().decode(profileDTO.getResume());
                // Validate that the file is a PDF by checking the magic bytes (%PDF = 25 50 44 46)
                if (resumeBytes.length < 4 ||
                    resumeBytes[0] != 0x25 ||
                    resumeBytes[1] != 0x50 ||
                    resumeBytes[2] != 0x44 ||
                    resumeBytes[3] != 0x46) {
                    throw new JobPortalException("RESUME_NOT_PDF");
                }
                existing.setResume(resumeBytes);
            }
        }
        if (profileDTO.getCompanySize() != null) existing.setCompanySize(profileDTO.getCompanySize());
        if (profileDTO.getIndustry() != null) existing.setIndustry(profileDTO.getIndustry());
        if (profileDTO.getWebsite() != null) existing.setWebsite(profileDTO.getWebsite());
        if (profileDTO.getHeadquarters() != null) existing.setHeadquarters(profileDTO.getHeadquarters());
        if (profileDTO.getSpecialties() != null) existing.setSpecialties(profileDTO.getSpecialties());
        if (profileDTO.getFollowerCount() != null) existing.setFollowerCount(profileDTO.getFollowerCount());
        if (profileDTO.getCompanyLogo() != null && !profileDTO.getCompanyLogo().isBlank()) existing.setCompanyLogo(Base64.getDecoder().decode(profileDTO.getCompanyLogo()));

        profileRepository.save(existing);
        createProfileUpdatedNotification(existing, profileDTO);
        return existing.toDTO();
    }

    private void createProfileUpdatedNotification(Profile existingProfile, ProfileDTO profileDTO) {
        Optional<User> optionalUser = Optional.empty();

        if (profileDTO.getEmail() != null && !profileDTO.getEmail().isBlank()) {
            optionalUser = userRepository.findByEmail(profileDTO.getEmail());
        }

        if (optionalUser.isEmpty() && existingProfile.getEmail() != null && !existingProfile.getEmail().isBlank()) {
            optionalUser = userRepository.findByEmail(existingProfile.getEmail());
        }

        optionalUser.ifPresent(user -> {
            try {
                notificationService.createNotification(
                        new NotificationDTO(
                                null,
                                user.getId(),
                                "Profile updated",
                                "Your profile changes were saved successfully.",
                                "/profile",
                                LocalDateTime.now(),
                                false,
                                "PROFILE"
                        )
                );
            } catch (Exception e) {
                System.out.println("Failed to create profile notification: " + e.getMessage());
            }
        });
    }

    @Override
    public ProfileDTO getCompanyProfile(String companyName) throws JobPortalException {
        Profile profile = profileRepository.findFirstByCompany(companyName)
                .orElseThrow(() -> new JobPortalException("company.not.found"));
        return profile.toDTO();
    }

    @Override
    public List<ProfileDTO> getApplicantProfiles() throws JobPortalException {
        List<Long> profileIds = userRepository.findByAccountType(AccountType.APPLICANT)
                .stream()
                .map(User::getProfileId)
                .filter(id -> id != null)
                .toList();

        return profileRepository.findAllById(profileIds)
                .stream()
                .map(Profile::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProfileDTO> getProfilesByIds(List<Long> ids) throws JobPortalException {
        List<Profile> profiles = profileRepository.findAllById(ids);
        return profiles.stream().map(Profile::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<ProfileDTO> getProfilesByCompany(String companyName) throws JobPortalException {
        return profileRepository.findByCompany(companyName)
                .stream()
                .map(Profile::toDTO)
                .collect(Collectors.toList());
    }
}
