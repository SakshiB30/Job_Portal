package com.jobportal.Job.Portal.repository;

import com.jobportal.Job.Portal.entity.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProfileRepository extends MongoRepository<Profile, Long> {
}
