package com.jobportal.Job.Portal.repository;

import com.jobportal.Job.Portal.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import com.jobportal.Job.Portal.dto.AccountType;

@Repository
public interface UserRepository extends MongoRepository<User, Long> {

    public Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByAccountType(AccountType accountType);
    long countByAccountType(AccountType accountType);
    List<User> findByProfileIdIn(List<Long> profileIds);
}
