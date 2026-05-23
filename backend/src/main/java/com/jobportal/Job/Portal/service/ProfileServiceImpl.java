package com.jobportal.Job.Portal.service;


import com.jobportal.Job.Portal.dto.ProfileDTO;
import com.jobportal.Job.Portal.entity.Profile;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.repository.ProfileRepository;
import com.jobportal.Job.Portal.utility.Utilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service("profileService")
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

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
        profileRepository.save(profile);
        return profile.getId();
    }

    @Override
    public ProfileDTO getProfile(Long id) throws JobPortalException {
        return profileRepository.findById(id).orElseThrow(()->new JobPortalException("PROFILE_NOT_FOUND")).toDTO();
    }

    @Override
    public ProfileDTO updateProfile(ProfileDTO profileDTO) throws JobPortalException {
        profileRepository.findById(profileDTO.getId()).orElseThrow(()->new JobPortalException("PROFILE_NOT_FOUND")).toDTO();
        profileRepository.save(profileDTO.toEntity());
        return profileDTO;
    }

    @Override
    public ProfileDTO getCompanyProfile(String companyName) throws JobPortalException {
        Profile profile = profileRepository.findFirstByCompany(companyName)
                .orElseThrow(() -> new JobPortalException("company.not.found"));
        return profile.toDTO();
    }

    @Override
    public List<ProfileDTO> getProfilesByCompany(String companyName) throws JobPortalException {
        return profileRepository.findByCompany(companyName)
                .stream()
                .map(Profile::toDTO)
                .collect(Collectors.toList());
    }
}
