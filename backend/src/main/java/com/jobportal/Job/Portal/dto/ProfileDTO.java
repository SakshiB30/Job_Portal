package com.jobportal.Job.Portal.dto;

import com.jobportal.Job.Portal.entity.Profile;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDTO {
    private Long id;
    private String email;
    private String jobTitle;
    private String company;
    private String location;
    private String about;
    private String banner;
    private String picture;
    private String phone;
    private String portfolio;
    private String resumeHeadline;
    private List<Map<String, String>> education;
    private List<Map<String, String>> projects;
    private List<String> achievements;
    private List<String> skills;
    private List<Experience> experiences;
    private List<Certification> certifications;
    private String resume;

    // ── Company metadata fields ──
    private String companySize;
    private String industry;
    private String website;
    private String headquarters;
    private List<String> specialties;
    private Integer followerCount;
    private String companyLogo;

    public Profile toEntity() {
        return new Profile(this.id, this.email, this.jobTitle, this.company, this.location,
                this.about,
                this.banner != null ? Base64.getDecoder().decode(this.banner) : null,
                this.picture != null ? Base64.getDecoder().decode(this.picture) : null,
                this.phone, this.portfolio, this.resumeHeadline,
                this.education, this.projects, this.achievements, this.skills,
                this.experiences, this.certifications,
                this.resume != null ? Base64.getDecoder().decode(this.resume) : null,
                this.companySize, this.industry, this.website, this.headquarters, this.specialties,
                this.followerCount,
                this.companyLogo != null ? Base64.getDecoder().decode(this.companyLogo) : null);
    }
}
