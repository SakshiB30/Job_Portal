package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.ProfileDTO;
import com.jobportal.Job.Portal.exception.JobPortalException;

public interface ProfileService {
    public Long createProfile(String email) throws JobPortalException;
    public ProfileDTO getProfile(Long id) throws JobPortalException;
    public ProfileDTO updateProfile(ProfileDTO profileDTO) throws JobPortalException;
}
