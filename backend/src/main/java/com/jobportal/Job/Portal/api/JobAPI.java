package com.jobportal.Job.Portal.api;

import com.jobportal.Job.Portal.dto.JobDTO;
import com.jobportal.Job.Portal.dto.ApplicantDTO;
import com.jobportal.Job.Portal.dto.ApplicationStatus;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.service.JobService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@Validated
@RequestMapping("/jobs")
public class JobAPI {

    @Autowired
    private JobService jobService;

    @PostMapping("/post")
    public ResponseEntity<JobDTO> postJob(
            @RequestBody @Valid JobDTO jobDTO
    ) throws JobPortalException {

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
    public ResponseEntity<List<JobDTO>> getAppliedJobs(
            @PathVariable Long userId
    ) throws JobPortalException {

        return new ResponseEntity<>(
                jobService.getAppliedJobs(userId),
                HttpStatus.OK
        );
    }

    @PutMapping("/{jobId}/applicants/{applicantId}/status/{status}")
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
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id
    ) throws JobPortalException {

        jobService.deleteJob(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/close/{id}")
    public ResponseEntity<JobDTO> closeJob(
            @PathVariable Long id
    ) throws JobPortalException {

        return new ResponseEntity<>(
                jobService.closeJob(id),
                HttpStatus.OK
        );
    }
}