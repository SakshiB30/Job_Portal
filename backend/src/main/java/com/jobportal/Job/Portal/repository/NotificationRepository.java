package com.jobportal.Job.Portal.repository;

import com.jobportal.Job.Portal.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByTimeStampDesc(Long recipientId);
}
