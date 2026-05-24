package com.jobportal.Job.Portal.api;

import com.jobportal.Job.Portal.dto.ProfileDTO;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@Validated
@RequestMapping("/profiles")
public class ProfileAPI {

    @Autowired
    private ProfileService profileService;


    @GetMapping("/get/{id}")
    public ResponseEntity<ProfileDTO> getProfile(@PathVariable Long id) throws JobPortalException {
       return new ResponseEntity<>(profileService.getProfile(id), HttpStatus.OK);
    }

    @GetMapping("/company/{companyName}")
    public ResponseEntity<ProfileDTO> getCompanyProfile(@PathVariable String companyName) throws JobPortalException {
        return new ResponseEntity<>(profileService.getCompanyProfile(companyName), HttpStatus.OK);
    }

    @GetMapping("/company/{companyName}/employees")
    public ResponseEntity<List<ProfileDTO>> getCompanyEmployees(@PathVariable String companyName) throws JobPortalException {
        return new ResponseEntity<>(profileService.getProfilesByCompany(companyName), HttpStatus.OK);
    }

    @GetMapping("/applicants")
    public ResponseEntity<List<ProfileDTO>> getApplicantProfiles() throws JobPortalException {
        return new ResponseEntity<>(profileService.getApplicantProfiles(), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<ProfileDTO> updateProfile(@RequestBody ProfileDTO profileDTO) throws JobPortalException {
        return new ResponseEntity<>(profileService.updateProfile(profileDTO), HttpStatus.OK);
    }

}
