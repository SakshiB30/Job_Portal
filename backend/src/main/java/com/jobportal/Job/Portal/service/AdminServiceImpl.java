package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.*;
import com.jobportal.Job.Portal.entity.Job;
import com.jobportal.Job.Portal.entity.Profile;
import com.jobportal.Job.Portal.entity.User;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.repository.JobRepository;
import com.jobportal.Job.Portal.repository.ProfileRepository;
import com.jobportal.Job.Portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

@Service
public class AdminServiceImpl implements AdminService {
    @Autowired private UserRepository userRepository;
    @Autowired private ProfileRepository profileRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private BCryptPasswordEncoder passwordEncoder;

    @Override
    public UserDTO getProfile(String email) throws JobPortalException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        if (user.getAccountType() != AccountType.ADMIN) throw new JobPortalException("ADMIN_ACCESS_DENIED");
        return user.toDTO();
    }

    @Override
    public UserDTO updateProfile(String email, UserDTO userDTO) throws JobPortalException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        if (user.getAccountType() != AccountType.ADMIN) throw new JobPortalException("ADMIN_ACCESS_DENIED");
        if (userDTO.getName() != null && !userDTO.getName().isBlank()) user.setName(userDTO.getName());
        if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        return userRepository.save(user).toDTO();
    }

    @Override
    public AdminStatsResponseDTO getStats() {
        List<Job> jobs = jobRepository.findAll();
        long applications = jobs.stream().mapToLong(job -> job.getApplicants() == null ? 0 : job.getApplicants().size()).sum();
        long pendingCompanies = userRepository.findByAccountType(AccountType.EMPLOYER).stream()
                .filter(u -> !"APPROVED".equals(u.getCompanyStatus()))
                .count();
        return new AdminStatsResponseDTO(
                userRepository.countByAccountType(AccountType.APPLICANT),
                userRepository.countByAccountType(AccountType.EMPLOYER),
                jobs.size(),
                applications,
                jobRepository.countByJobStatus(JobStatus.OPEN),
                jobRepository.countByJobStatus(JobStatus.CLOSED) + jobRepository.countByJobStatus(JobStatus.DRAFT),
                getUsers(null).stream().limit(5).toList(),
                getCompanies(null).stream().limit(5).toList()
        );
    }

    @Override
    public List<AdminUserResponseDTO> getUsers(String search) {
        return userRepository.findByAccountType(AccountType.APPLICANT).stream()
                .filter(user -> matches(user.getName(), search) || matches(user.getEmail(), search))
                .sorted(Comparator.comparing(User::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toUserResponse)
                .toList();
    }

    @Override
    public List<AdminCompanyResponseDTO> getCompanies(String search) {
        return userRepository.findByAccountType(AccountType.EMPLOYER).stream()
                .filter(user -> matches(user.getName(), search) || matches(user.getEmail(), search) || matches(getProfile(user).getCompany(), search))
                .sorted(Comparator.comparing(User::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toCompanyResponse)
                .toList();
    }

    @Override
    public AdminUserResponseDTO blockUser(Long id, boolean blocked) throws JobPortalException {
        User user = userRepository.findById(id).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        if (user.getAccountType() != AccountType.APPLICANT) throw new JobPortalException("INVALID_ACCOUNT_TYPE");
        user.setBlocked(blocked);
        return toUserResponse(userRepository.save(user));
    }

    @Override
    public AdminCompanyResponseDTO blockCompany(Long id, boolean blocked) throws JobPortalException {
        User user = userRepository.findById(id).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        if (user.getAccountType() != AccountType.EMPLOYER) throw new JobPortalException("INVALID_ACCOUNT_TYPE");
        user.setBlocked(blocked);
        return toCompanyResponse(userRepository.save(user));
    }

    @Override
    public List<AdminCompanyResponseDTO> getVerificationRequests(String status) throws JobPortalException {
        Stream<User> stream = userRepository.findByAccountType(AccountType.EMPLOYER).stream();
        if (status != null && !status.isBlank()) {
            stream = stream.filter(u -> status.equals(u.getCompanyStatus()));
        }
        return stream
                .sorted(Comparator.comparing(User::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toCompanyResponse)
                .toList();
    }

    @Override
    public AdminCompanyResponseDTO approveCompany(Long id) throws JobPortalException {
        User user = userRepository.findById(id).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        if (user.getAccountType() != AccountType.EMPLOYER) throw new JobPortalException("INVALID_ACCOUNT_TYPE");
        user.setCompanyStatus("APPROVED");
        return toCompanyResponse(userRepository.save(user));
    }

    @Override
    public AdminCompanyResponseDTO rejectCompany(Long id) throws JobPortalException {
        User user = userRepository.findById(id).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        if (user.getAccountType() != AccountType.EMPLOYER) throw new JobPortalException("INVALID_ACCOUNT_TYPE");
        user.setCompanyStatus("REJECTED");
        return toCompanyResponse(userRepository.save(user));
    }

    private AdminUserResponseDTO toUserResponse(User user) {
        int applied = user.getAppliedJobs() == null ? 0 : user.getAppliedJobs().size();
        return new AdminUserResponseDTO(user.getId(), user.getName(), user.getEmail(), user.getAccountType(), user.getProfileId(), Boolean.TRUE.equals(user.getBlocked()), applied);
    }

    private AdminCompanyResponseDTO toCompanyResponse(User user) {
        Profile profile = getProfile(user);
        String company = profile.getCompany() == null || profile.getCompany().isBlank() ? user.getName() : profile.getCompany();
        return new AdminCompanyResponseDTO(user.getId(), user.getName(), user.getEmail(), user.getProfileId(), Boolean.TRUE.equals(user.getBlocked()), company, profile.getIndustry(), profile.getLocation(), jobRepository.findByCompany(company).size(), user.getCompanyStatus());
    }

    private Profile getProfile(User user) {
        if (user.getProfileId() == null) return new Profile();
        return profileRepository.findById(user.getProfileId()).orElse(new Profile());
    }

    private boolean matches(String value, String search) {
        if (search == null || search.isBlank()) return true;
        return value != null && value.toLowerCase(Locale.ROOT).contains(search.toLowerCase(Locale.ROOT));
    }
}
