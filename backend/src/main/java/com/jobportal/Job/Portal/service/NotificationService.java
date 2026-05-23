package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.NotificationDTO;
import com.jobportal.Job.Portal.dto.AccountType;

import java.util.List;

public interface NotificationService {
    NotificationDTO createNotification(NotificationDTO dto) throws Exception;
    List<NotificationDTO> getNotificationsForUser(Long userId) throws Exception;
    NotificationDTO markRead(Long notificationId) throws Exception;
    void markAllRead(Long userId) throws Exception;
    void notifyUsersByAccountType(AccountType accountType, String title, String message, String link) throws Exception;
}
