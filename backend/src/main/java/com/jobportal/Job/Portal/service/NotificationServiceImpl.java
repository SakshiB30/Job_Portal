package com.jobportal.Job.Portal.service;

import com.jobportal.Job.Portal.dto.AccountType;
import com.jobportal.Job.Portal.dto.NotificationDTO;
import com.jobportal.Job.Portal.entity.Notification;
import com.jobportal.Job.Portal.entity.User;
import com.jobportal.Job.Portal.repository.NotificationRepository;
import com.jobportal.Job.Portal.repository.UserRepository;
import com.jobportal.Job.Portal.utility.Utilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service("notificationService")
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Override
    public NotificationDTO createNotification(NotificationDTO dto) throws Exception {
        if (dto.getTimeStamp() == null) dto.setTimeStamp(LocalDateTime.now());
        if (dto.getId() == null) {
            dto.setId(Utilities.getNextSequence("notifications"));
        }
        Notification saved = notificationRepository.save(dto.toEntity());
        return new NotificationDTO(saved.getId(), saved.getRecipientId(), saved.getTitle(), saved.getMessage(), saved.getLink(), saved.getTimeStamp(), saved.isRead(), saved.getType());
    }

    @Override
    public List<NotificationDTO> getNotificationsForUser(Long userId) throws Exception {
        return notificationRepository.findByRecipientIdOrderByTimeStampDesc(userId)
                .stream()
                .map(n -> new NotificationDTO(n.getId(), n.getRecipientId(), n.getTitle(), n.getMessage(), n.getLink(), n.getTimeStamp(), n.isRead(), n.getType()))
                .collect(Collectors.toList());
    }

    @Override
    public NotificationDTO markRead(Long notificationId) throws Exception {
        Notification n = notificationRepository.findById(notificationId).orElseThrow(() -> new RuntimeException("NOTIFICATION_NOT_FOUND"));
        n.setRead(true);
        Notification saved = notificationRepository.save(n);
        return new NotificationDTO(saved.getId(), saved.getRecipientId(), saved.getTitle(), saved.getMessage(), saved.getLink(), saved.getTimeStamp(), saved.isRead(), saved.getType());
    }

    @Override
    public void markAllRead(Long userId) throws Exception {
        List<Notification> items = notificationRepository.findByRecipientIdOrderByTimeStampDesc(userId);
        for (Notification n : items) {
            if (!n.isRead()) n.setRead(true);
        }
        notificationRepository.saveAll(items);
    }

    @Override
    public void notifyUsersByAccountType(AccountType accountType, String title, String message, String link) throws Exception {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getAccountType() != null && user.getAccountType().name().equals(accountType.name())) {
                NotificationDTO dto = new NotificationDTO(null, user.getId(), title, message, link, LocalDateTime.now(), false, accountType.name());
                createNotification(dto);
                try {
                    if (user.getEmail() != null) {
                        emailService.sendNotificationEmail(user.getEmail(), title, message, link);
                    }
                } catch (Exception e) {
                    System.out.println("Failed sending notification email to " + user.getEmail() + " : " + e.getMessage());
                }
            }
        }
    }
}
