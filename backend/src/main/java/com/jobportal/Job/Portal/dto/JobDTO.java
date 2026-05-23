package com.jobportal.Job.Portal.dto;

import com.jobportal.Job.Portal.entity.Job;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobDTO {
    @Id
    private Long id;
    private String jobTitle;
    private String company;
    private List<ApplicantDTO> applicants;
    private String about;
    private String experience;
    private String jobType;
    private String location;
    private Long packageOffered;
    private LocalDateTime postTime;
    private String description;
    private List<String> skillsRequired;
    private JobStatus jobStatus;

    public Job toEntity() {
        java.util.List<com.jobportal.Job.Portal.entity.Applicant> entityList = null;
        if (this.applicants != null) {
            entityList = this.applicants.stream().map(a -> a.toEntity()).collect(java.util.stream.Collectors.toList());
        }
        return new Job(this.id, this.jobTitle, this.company, entityList, this.about, this.experience, this.jobType, this.location, this.packageOffered, this.postTime, this.description, this.skillsRequired, this.jobStatus);
    }
}
