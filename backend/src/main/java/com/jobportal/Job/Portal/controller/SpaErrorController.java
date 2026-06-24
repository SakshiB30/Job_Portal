package com.jobportal.Job.Portal.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object requestUri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

        if (requestUri != null) {
            String uri = requestUri.toString();

            // Forward non-API 404s to index.html for SPA client-side routing
            if (!uri.startsWith("/api/")
                    && !uri.startsWith("/jobs/")
                    && !uri.startsWith("/profiles/")
                    && !uri.startsWith("/notifications/")) {
                return "forward:/index.html";
            }
        }

        // For API errors, return null to let Spring Boot's default error handling respond
        return null;
    }
}
