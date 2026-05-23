package com.jobportal.Job.Portal.dto;

import com.jobportal.Job.Portal.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long recipientId;
    private String title;
    private String message;
    private String link;
    private LocalDateTime timeStamp;
    private boolean read;
    private String type;

    public Notification toEntity() {
        return new Notification(this.id, this.recipientId, this.title, this.message, this.link, this.timeStamp, this.read, this.type);
    }
}
