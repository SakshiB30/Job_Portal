package com.jobportal.Job.Portal.api;

import com.jobportal.Job.Portal.dto.JobDTO;
import com.jobportal.Job.Portal.dto.ApplicantDTO;
import com.jobportal.Job.Portal.dto.ApplicationStatus;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.security.AuthorizationService;
import com.jobportal.Job.Portal.service.JobService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@CrossOrigin
@Validated
@RequestMapping("/jobs")
public class JobAPI {

    @Autowired
    private JobService jobService;

    @Autowired
    private AuthorizationService authorizationService;

    @PostMapping("/post")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobDTO> postJob(
            @RequestBody @Valid JobDTO jobDTO,
            Authentication authentication
    ) throws JobPortalException {
        jobDTO.setCompany(authorizationService.getEmployerCompanyName(authentication));

        return new ResponseEntity<>(
                jobService.postJob(jobDTO),
                HttpStatus.OK
        );
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<JobDTO>> getAllJobs()
            throws JobPortalException {

        return new ResponseEntity<>(
                jobService.getAllJobs(),
                HttpStatus.OK
        );
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<JobDTO> getJob(
            @PathVariable Long id
    ) throws JobPortalException {

        return new ResponseEntity<>(
                jobService.getJob(id),
                HttpStatus.OK
        );
    }

    @PostMapping("/apply/{id}")
    @PreAuthorize("@authz.canApply(#applicantDTO.applicantId, authentication)")
    public ResponseEntity<JobDTO> applyToJob(
            @PathVariable Long id,
            @RequestBody ApplicantDTO applicantDTO
    ) throws JobPortalException {

        return new ResponseEntity<>(
                jobService.applyToJob(id, applicantDTO),
                HttpStatus.OK
        );
    }

    // NEW API
    @GetMapping("/applications/{userId}")
    @PreAuthorize("@authz.isSelfOrAdmin(#userId, authentication)")
    public ResponseEntity<List<JobDTO>> getAppliedJobs(
            @PathVariable Long userId
    ) throws JobPortalException {

        return new ResponseEntity<>(
                jobService.getAppliedJobs(userId),
                HttpStatus.OK
        );
    }

    @PutMapping("/{jobId}/applicants/{applicantId}/status/{status}")
    @PreAuthorize("@authz.canManageJob(#jobId, authentication)")
    public ResponseEntity<JobDTO> updateApplicationStatus(
            @PathVariable Long jobId,
            @PathVariable Long applicantId,
            @PathVariable ApplicationStatus status
    ) throws JobPortalException {

        return new ResponseEntity<>(
                jobService.updateApplicationStatus(
                        jobId,
                        applicantId,
                        status
                ),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("@authz.canManageJob(#id, authentication)")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id
    ) throws JobPortalException {

        jobService.deleteJob(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/close/{id}")
    @PreAuthorize("@authz.canManageJob(#id, authentication)")
    public ResponseEntity<JobDTO> closeJob(
            @PathVariable Long id
    ) throws JobPortalException {

        return new ResponseEntity<>(
                jobService.closeJob(id),
                HttpStatus.OK
        );
    }

    @GetMapping("/company/{companyName}")
    public ResponseEntity<List<JobDTO>> getJobsByCompany(
            @PathVariable String companyName
    ) throws JobPortalException {

        return new ResponseEntity<>(
                jobService.getJobsByCompany(companyName),
                HttpStatus.OK
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<JobDTO>> getMyJobs() throws JobPortalException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return new ResponseEntity<>(
                jobService.getMyJobs(email),
                HttpStatus.OK
        );
    }
}
