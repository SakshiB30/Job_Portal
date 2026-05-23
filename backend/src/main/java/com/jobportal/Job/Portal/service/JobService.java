package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.JobDTO;
import com.jobportal.Job.Portal.dto.ApplicationStatus;
import com.jobportal.Job.Portal.dto.ApplicantDTO;
import com.jobportal.Job.Portal.exception.JobPortalException;
import jakarta.validation.Valid;

import java.util.List;

public interface JobService {

   public JobDTO postJob(@Valid JobDTO jobDTO) throws JobPortalException;

   public List<JobDTO> getAllJobs() throws JobPortalException;

   public JobDTO getJob(Long id) throws JobPortalException;

   public JobDTO applyToJob(Long id, ApplicantDTO applicantDTO)
           throws JobPortalException;

   public JobDTO updateApplicationStatus(
           Long jobId,
           Long applicantId,
           ApplicationStatus status
   ) throws JobPortalException;

   public void deleteJob(Long id) throws JobPortalException;

   public JobDTO closeJob(Long id) throws JobPortalException;

   // NEW METHOD
   public List<JobDTO> getAppliedJobs(Long userId)
           throws JobPortalException;
}