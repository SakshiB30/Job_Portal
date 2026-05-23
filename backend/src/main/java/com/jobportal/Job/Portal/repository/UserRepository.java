package com.jobportal.Job.Portal.repository;

import com.jobportal.Job.Portal.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, Long> {

    public Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
