package com.jobportal.Job.Portal.entity;

import com.jobportal.Job.Portal.dto.Certification;
import com.jobportal.Job.Portal.dto.Experience;
import com.jobportal.Job.Portal.dto.ProfileDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "profiles")
public class Profile {
    @Id
    private Long id;
    private String email;
    private String jobTitle;
    private String company;
    private String location;
    private String about;
    private byte[] banner;
    private byte[] picture;
    private String phone;
    private String portfolio;
    private String resumeHeadline;
    private List<Map<String, String>> education;
    private List<Map<String, String>> projects;
    private List<String> achievements;
    private List<String>skills;
    private List<Experience>experiences;
    private List<Certification>certifications;

    public ProfileDTO toDTO() {
        return new ProfileDTO(this.id, this.email, this.jobTitle, this.company, this.location, this.about, this.banner!=null? Base64.getEncoder().encodeToString(this.banner):null, this.picture!=null? Base64.getEncoder().encodeToString(this.picture):null, this.phone, this.portfolio, this.resumeHeadline, this.education, this.projects, this.achievements, this.skills, this.experiences, this.certifications);
    }


}
