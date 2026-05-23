package com.jobportal.Job.Portal.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private Long id;
    private Long recipientId;
    private String title;
    private String message;
    private String link;
    private LocalDateTime timeStamp;
    private boolean read;
    private String type;
}
