package com.jobportal.Job.Portal.dto;

import com.jobportal.Job.Portal.entity.Applicant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantDTO {
    private Long applicantId;
    private Long profileId;
    private String name;
    private String email;
    private Long phone;
    private String website;
    private String coverLetter;
    private String resume;
    private LocalDateTime timeStamp;
    private ApplicationStatus applicationStatus;
    private String interviewDate;
    private String interviewMode;
    private String interviewMeetingLink;
    private String interviewNotes;
    private LocalDateTime interviewDateTime;
    private Boolean reminderSent;


    public Applicant toEntity() {
        return new Applicant(this.applicantId, this.profileId, this.name,this.email, this.phone, this.website, this.coverLetter, this.resume, this.timeStamp, this.applicationStatus, this.interviewDate, this.interviewMode, this.interviewMeetingLink, this.interviewNotes, this.interviewDateTime, this.reminderSent);
    }
}
