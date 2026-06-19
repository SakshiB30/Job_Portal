package com.jobportal.Job.Portal.api;

import com.jobportal.Job.Portal.dto.*;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/admin")
public class AdminAPI {
    @Autowired private AdminService adminService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> profile(Authentication authentication) throws JobPortalException {
        return new ResponseEntity<>(adminService.getProfile(authentication.getName()), HttpStatus.OK);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(Authentication authentication, @RequestBody UserDTO userDTO) throws JobPortalException {
        return new ResponseEntity<>(adminService.updateProfile(authentication.getName(), userDTO), HttpStatus.OK);
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponseDTO> stats() {
        return new ResponseEntity<>(adminService.getStats(), HttpStatus.OK);
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponseDTO>> users(@RequestParam(required = false) String search) {
        return new ResponseEntity<>(adminService.getUsers(search), HttpStatus.OK);
    }

    @GetMapping("/companies")
    public ResponseEntity<List<AdminCompanyResponseDTO>> companies(@RequestParam(required = false) String search) {
        return new ResponseEntity<>(adminService.getCompanies(search), HttpStatus.OK);
    }

    @PatchMapping("/block-user/{id}")
    public ResponseEntity<AdminUserResponseDTO> blockUser(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean blocked) throws JobPortalException {
        return new ResponseEntity<>(adminService.blockUser(id, blocked), HttpStatus.OK);
    }

    @PatchMapping("/block-company/{id}")
    public ResponseEntity<AdminCompanyResponseDTO> blockCompany(@PathVariable Long id, @RequestParam(defaultValue = "true") boolean blocked) throws JobPortalException {
        return new ResponseEntity<>(adminService.blockCompany(id, blocked), HttpStatus.OK);
    }
}
