package com.jobportal.Job.Portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private AccountType accountType;
    private Long profileId;
    private Boolean blocked;
    private Integer appliedJobsCount;
}
