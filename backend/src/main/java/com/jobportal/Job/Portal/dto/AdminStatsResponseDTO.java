package com.jobportal.Job.Portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponseDTO {
    private long totalUsers;
    private long totalCompanies;
    private long totalJobs;
    private long totalApplications;
    private long activeJobs;
    private long inactiveJobs;
    private List<AdminUserResponseDTO> recentUsers;
    private List<AdminCompanyResponseDTO> recentCompanies;
}
