package com.jobportal.Job.Portal.repository;

import com.jobportal.Job.Portal.entity.Job;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface JobRepository extends MongoRepository<Job, Long> {
    List<Job> findByCompany(String company);
}
