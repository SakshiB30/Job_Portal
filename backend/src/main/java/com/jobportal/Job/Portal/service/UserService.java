package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.LoginDTO;
import com.jobportal.Job.Portal.dto.ResponseDTO;
import com.jobportal.Job.Portal.dto.UserDTO;
import com.jobportal.Job.Portal.exception.JobPortalException;
import jakarta.validation.Valid;
import java.util.Map;

public interface UserService {
    public UserDTO registerUser(UserDTO userDTO) throws JobPortalException;

    public UserDTO loginUser(LoginDTO loginDTO) throws JobPortalException;

    public UserDTO getUserById(Long id) throws JobPortalException;

    public UserDTO toggleSavedJob(Long userId, Long jobId) throws JobPortalException;

    public UserDTO toggleLikedJob(Long userId, Long jobId) throws JobPortalException;

    public UserDTO markInterviewingJob(Long userId, Long jobId) throws JobPortalException;

    public UserDTO markOfferedJob(Long userId, Long jobId) throws JobPortalException;

    public boolean sendOtp(String email) throws Exception;

    public boolean verifyOtp(String email, String otp) throws JobPortalException;

    public ResponseDTO changePassword(@Valid LoginDTO loginDTO) throws JobPortalException;

    public ResponseDTO sendSelectionEmail(Map<String, String> selectionDetails) throws Exception;
}
