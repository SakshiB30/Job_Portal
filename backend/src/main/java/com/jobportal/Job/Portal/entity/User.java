package com.jobportal.Job.Portal.entity;

import com.jobportal.Job.Portal.dto.AccountType;
import com.jobportal.Job.Portal.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private Long id;
    private String name;
    @Indexed(unique = true)
    private String email;
    private String password;
    private AccountType accountType;
    private Long profileId;
    private List<Long> savedJobs;
    private List<Long> likedJobs;
    private List<Long> appliedJobs;
    private List<Long> interviewingJobs;
    private List<Long> offeredJobs;
    private List<Long> following;
    private Boolean blocked;
    private String companyStatus;

    public UserDTO toDTO(){
        return new UserDTO(
                this.id,
                this.name,
                this.email,
                this.password,
                this.accountType,
                this.profileId,
                this.savedJobs == null ? new ArrayList<>() : this.savedJobs,
                this.likedJobs == null ? new ArrayList<>() : this.likedJobs,
                this.appliedJobs == null ? new ArrayList<>() : this.appliedJobs,
                this.interviewingJobs == null ? new ArrayList<>() : this.interviewingJobs,
                this.offeredJobs == null ? new ArrayList<>() : this.offeredJobs,
                this.following == null ? new ArrayList<>() : this.following,
                this.blocked,
                this.companyStatus
        );
    }

}
