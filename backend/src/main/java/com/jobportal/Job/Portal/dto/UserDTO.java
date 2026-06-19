package com.jobportal.Job.Portal.dto;

import com.jobportal.Job.Portal.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    @NotBlank(message = "{user.name.absent}")
    private String name;
    @NotBlank(message = "{user.email.absent}")
    @Email(message = "{user.email.invalid}")
    private String email;
    @NotBlank(message = "{user.password.absent}")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&^#])[A-Za-z\\d@$!%*?&^#]{8,15}$", message = "{user.password.invalid}")
    private String password;
    private AccountType accountType;
    private Long profileId;
    private List<Long> savedJobs = new ArrayList<>();
    private List<Long> likedJobs = new ArrayList<>();
    private List<Long> appliedJobs = new ArrayList<>();
    private List<Long> interviewingJobs = new ArrayList<>();
    private List<Long> offeredJobs = new ArrayList<>();
    private List<Long> following = new ArrayList<>();
    private Boolean blocked = false;

    public User toEntity(){
        return new User(
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
                this.following,
                this.blocked
        );

    }
}


