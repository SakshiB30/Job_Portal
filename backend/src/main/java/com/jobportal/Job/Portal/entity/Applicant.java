package com.jobportal.Job.Portal.entity;

import com.jobportal.Job.Portal.dto.ApplicantDTO;
import com.jobportal.Job.Portal.dto.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Base64;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "applicants")
public class Applicant {
    private Long applicantId;
    private String name;
    private String email;
    private Long phone;
    private String website;
    private byte[] resume;
    private String coverLetter;
    private LocalDateTime timeStamp;
    private ApplicationStatus applicationStatus;

    public ApplicantDTO toDTO() {
        return new ApplicantDTO(this.applicantId, this.name,this.email, this.phone, this.website, this.resume!=null? Base64.getEncoder().encodeToString(this.resume):null, this.coverLetter, this.timeStamp, this.applicationStatus);
    }
}
