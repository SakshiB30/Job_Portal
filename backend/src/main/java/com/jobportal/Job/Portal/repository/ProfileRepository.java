package com.jobportal.Job.Portal.repository;

import com.jobportal.Job.Portal.entity.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ProfileRepository extends MongoRepository<Profile, Long> {
    Optional<Profile> findFirstByCompany(String company);
    List<Profile> findByCompany(String company);

    @Query("{ 'company' : { $regex : ?0, $options: 'i' } }")
    List<Profile> findByCompanyIgnoreCase(String company);

    @Query("{ 'company' : { $in : ?0 } }")
    List<Profile> findByCompanyIn(Set<String> companies);
}
