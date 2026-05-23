package com.jobportal.Job.Portal.service;

import java.util.List;

import com.jobportal.Job.Portal.dto.ProfileDTO;
import com.jobportal.Job.Portal.exception.JobPortalException;

public interface ProfileService {
    public Long createProfile(String email) throws JobPortalException;
    public ProfileDTO getProfile(Long id) throws JobPortalException;
    public ProfileDTO updateProfile(ProfileDTO profileDTO) throws JobPortalException;
    public ProfileDTO getCompanyProfile(String companyName) throws JobPortalException;
    public List<ProfileDTO> getProfilesByCompany(String companyName) throws JobPortalException;
}
