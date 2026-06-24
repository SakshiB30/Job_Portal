package com.jobportal.Job.Portal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardingController {

    @GetMapping(value = {
            "/",
            "/sign-up",
            "/login",
            "/about",
            "/find-jobs",
            "/jobs/**",
            "/dashboard",
            "/post-job",
            "/posted-job",
            "/profile",
            "/job-history",
            "/talent-profile",
            "/talent-profile/**",
            "/admin-login",
            "/admin/**",
            "/reset-password"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
