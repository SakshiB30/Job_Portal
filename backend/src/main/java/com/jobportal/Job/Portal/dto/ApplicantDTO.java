package com.jobportal.Job.Portal.dto;

import com.jobportal.Job.Portal.entity.Applicant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Base64;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantDTO {
    private Long applicantId;
    private String name;
    private String email;
    private Long phone;
    private String website;
    private String resume;
    private String coverLetter;
    private LocalDateTime timeStamp;
    private ApplicationStatus applicationStatus;


    public Applicant toEntity() {
        return new Applicant(this.applicantId, this.name,this.email, this.phone, this.website, this.resume!=null? Base64.getDecoder().decode(this.resume):null, this.coverLetter, this.timeStamp, this.applicationStatus);
    }
}
