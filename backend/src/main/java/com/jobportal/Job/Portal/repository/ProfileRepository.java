package com.jobportal.Job.Portal.repository;

import com.jobportal.Job.Portal.entity.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileRepository extends MongoRepository<Profile, Long> {
    Optional<Profile> findFirstByCompany(String company);
    List<Profile> findByCompany(String company);
}
