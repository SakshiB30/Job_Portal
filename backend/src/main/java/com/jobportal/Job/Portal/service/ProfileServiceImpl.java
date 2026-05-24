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
        Profile existingProfile = profileRepository.findById(profileDTO.getId()).orElseThrow(()->new JobPortalException("PROFILE_NOT_FOUND"));
        profileRepository.save(profileDTO.toEntity());
        createProfileUpdatedNotification(existingProfile, profileDTO);
        return profileDTO;
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
        List<Long> profileIds = userRepository.findAll()
                .stream()
                .filter(user -> user.getAccountType() == AccountType.APPLICANT)
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
