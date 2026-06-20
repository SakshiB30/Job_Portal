package com.jobportal.Job.Portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminCompanyResponseDTO {
    private Long id;
    private String name;
    private String email;
    private Long profileId;
    private Boolean blocked;
    private String company;
    private String industry;
    private String location;
    private Integer jobsPostedCount;
    private String companyStatus;
}
