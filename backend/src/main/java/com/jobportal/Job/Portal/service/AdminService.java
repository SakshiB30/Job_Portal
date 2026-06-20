package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.*;
import com.jobportal.Job.Portal.exception.JobPortalException;

import java.util.List;

public interface AdminService {
    UserDTO getProfile(String email) throws JobPortalException;
    UserDTO updateProfile(String email, UserDTO userDTO) throws JobPortalException;
    AdminStatsResponseDTO getStats();
    List<AdminUserResponseDTO> getUsers(String search);
    List<AdminCompanyResponseDTO> getCompanies(String search);
    AdminUserResponseDTO blockUser(Long id, boolean blocked) throws JobPortalException;
    AdminCompanyResponseDTO blockCompany(Long id, boolean blocked) throws JobPortalException;
    List<AdminCompanyResponseDTO> getVerificationRequests(String status) throws JobPortalException;
    AdminCompanyResponseDTO approveCompany(Long id) throws JobPortalException;
    AdminCompanyResponseDTO rejectCompany(Long id) throws JobPortalException;
}
