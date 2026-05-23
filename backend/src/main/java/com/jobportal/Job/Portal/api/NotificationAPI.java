package com.jobportal.Job.Portal.api;

import com.jobportal.Job.Portal.dto.NotificationDTO;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/notifications")
public class NotificationAPI {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getForUser(@PathVariable Long userId) throws JobPortalException {
        try {
            return new ResponseEntity<>(notificationService.getNotificationsForUser(userId), HttpStatus.OK);
        } catch (Exception e) {
            throw new JobPortalException(e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markRead(@PathVariable Long id) throws JobPortalException {
        try {
            return new ResponseEntity<>(notificationService.markRead(id), HttpStatus.OK);
        } catch (Exception e) {
            throw new JobPortalException(e.getMessage());
        }
    }

    @PutMapping("/user/{userId}/readAll")
    public ResponseEntity<Void> markAllRead(@PathVariable Long userId) throws JobPortalException {
        try {
            notificationService.markAllRead(userId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            throw new JobPortalException(e.getMessage());
        }
    }
}

