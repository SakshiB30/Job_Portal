package com.jobportal.Job.Portal.entity;

import com.jobportal.Job.Portal.dto.AccountType;
import com.jobportal.Job.Portal.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private List<Long> rejectedJobs;
    private List<Long> acceptedJobs;
    private List<Long> declinedJobs;
    private List<Long> following;

    public UserDTO toDTO(){
        return new UserDTO(
                this.id,
                this.name,
                this.email,
                this.password,
                this.accountType,
                this.profileId,
                this.savedJobs,
                this.likedJobs,
                this.appliedJobs,
                this.interviewingJobs,
                this.offeredJobs,
                this.rejectedJobs,
                this.acceptedJobs,
                this.declinedJobs,
                this.following
        );
    }

}




