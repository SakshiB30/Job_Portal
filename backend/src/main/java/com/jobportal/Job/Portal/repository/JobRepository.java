package com.jobportal.Job.Portal.repository;

import com.jobportal.Job.Portal.entity.Job;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import com.jobportal.Job.Portal.dto.JobStatus;

public interface JobRepository extends MongoRepository<Job, Long> {
    List<Job> findByCompany(String company);
    long countByJobStatus(JobStatus jobStatus);
}
