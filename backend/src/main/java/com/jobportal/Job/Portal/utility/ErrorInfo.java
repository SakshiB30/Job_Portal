package com.jobportal.Job.Portal.utility;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ErrorInfo {
    private String errorMessage;
    private Integer errorCode;
    private LocalDateTime timeStamp;


}
