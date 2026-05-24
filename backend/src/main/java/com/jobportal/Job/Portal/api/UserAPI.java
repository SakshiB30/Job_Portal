package com.jobportal.Job.Portal.api;

import com.jobportal.Job.Portal.dto.LoginDTO;
import com.jobportal.Job.Portal.dto.ResponseDTO;
import com.jobportal.Job.Portal.dto.UserDTO;
import com.jobportal.Job.Portal.exception.JobPortalException;
import com.jobportal.Job.Portal.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import com.jobportal.Job.Portal.dto.ProfileDTO;
import jakarta.servlet.http.HttpServletResponse;
import com.jobportal.Job.Portal.security.JwtUtil;

// import static org.springframework.security.config.http.MatcherType.regex;

@RestController
@CrossOrigin
@Validated
@RequestMapping("/api/users")
public class UserAPI {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody @Valid UserDTO userDTO) throws JobPortalException {
        userDTO = userService.registerUser(userDTO);
        return new ResponseEntity<>(userDTO, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(
            @RequestBody @Valid LoginDTO loginDTO,
            HttpServletResponse response) throws JobPortalException {

        UserDTO userDTO = userService.loginUser(loginDTO);

        String token = jwtUtil.generateToken(userDTO.getEmail());

        response.setHeader("Authorization", "Bearer " + token);

        Map<String, Object> responseBody = new HashMap<>();

        responseBody.put("token", token);
        responseBody.put("user", userDTO);

        return new ResponseEntity<>(responseBody, HttpStatus.OK);
    }

    @PostMapping("/changePass")
    public ResponseEntity<ResponseDTO> changePass(@RequestBody @Valid LoginDTO loginDTO) throws JobPortalException {

        return new ResponseEntity<>(userService.changePassword(loginDTO), HttpStatus.OK);
    }

    @PostMapping("/resetPass")
    public ResponseEntity<ResponseDTO> resetPass(@RequestBody Map<String, String> resetDetails) throws JobPortalException {
        String email = resetDetails.get("email");
        String otp = resetDetails.get("otp");
        String password = resetDetails.get("password");

        if (email == null || email.isBlank()) {
            throw new JobPortalException("EMAIL_REQUIRED");
        }

        if (otp == null || !otp.matches("^[0-9]{6}$")) {
            throw new JobPortalException("OTP_INCORRECT");
        }

        if (password == null || password.isBlank()) {
            throw new JobPortalException("PASSWORD_REQUIRED");
        }

        userService.verifyOtp(email, otp);
        return new ResponseEntity<>(userService.changePassword(new LoginDTO(email, password)), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) throws JobPortalException {
        return new ResponseEntity<>(userService.getUserById(id), HttpStatus.OK);
    }

    @PostMapping("/{userId}/save/{jobId}")
    public ResponseEntity<UserDTO> toggleSavedJob(@PathVariable Long userId, @PathVariable Long jobId)
            throws JobPortalException {
        return new ResponseEntity<>(userService.toggleSavedJob(userId, jobId), HttpStatus.OK);
    }

    @PostMapping("/{userId}/like/{jobId}")
    public ResponseEntity<UserDTO> toggleLikedJob(@PathVariable Long userId, @PathVariable Long jobId)
            throws JobPortalException {
        return new ResponseEntity<>(userService.toggleLikedJob(userId, jobId), HttpStatus.OK);
    }

    @PostMapping("/{userId}/interview/{jobId}")
    public ResponseEntity<UserDTO> markInterviewingJob(@PathVariable Long userId, @PathVariable Long jobId)
            throws JobPortalException {
        return new ResponseEntity<>(userService.markInterviewingJob(userId, jobId), HttpStatus.OK);
    }

    @PostMapping("/{userId}/offer/{jobId}")
    public ResponseEntity<UserDTO> markOfferedJob(@PathVariable Long userId, @PathVariable Long jobId)
            throws JobPortalException {
        return new ResponseEntity<>(userService.markOfferedJob(userId, jobId), HttpStatus.OK);
    }

    @PostMapping("/sendOtp/{email}")
    public ResponseEntity<ResponseDTO> sendOtp(@PathVariable @Email(message = "{user.email.invalid}") String email)
            throws Exception {
        userService.sendOtp(email);
        return new ResponseEntity<>(new ResponseDTO("OTP sent successfully."), HttpStatus.OK);
    }

    @GetMapping("/verifyOtp/{email}/{otp}")
    public ResponseEntity<ResponseDTO> verifyOtp(@PathVariable @Email(message = "{user.email.invalid}") String email,
            @PathVariable @Pattern(regexp = "^[0-9]{6}$", message = "{otp.invalid}") String otp)
            throws JobPortalException {
        userService.verifyOtp(email, otp);
        return new ResponseEntity<>(new ResponseDTO("OTP has been varified."), HttpStatus.OK);
    }

    @PostMapping("/{userId}/follow/{profileId}")
    public ResponseEntity<UserDTO> followProfile(@PathVariable Long userId, @PathVariable Long profileId)
            throws JobPortalException {
        return new ResponseEntity<>(userService.followProfile(userId, profileId), HttpStatus.OK);
    }

    @PostMapping("/{userId}/unfollow/{profileId}")
    public ResponseEntity<UserDTO> unfollowProfile(@PathVariable Long userId, @PathVariable Long profileId)
            throws JobPortalException {
        return new ResponseEntity<>(userService.unfollowProfile(userId, profileId), HttpStatus.OK);
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<ProfileDTO>> getFollowing(@PathVariable Long userId)
            throws JobPortalException {
        return new ResponseEntity<>(userService.getFollowing(userId), HttpStatus.OK);
    }

    @PostMapping("/selection-email")
    public ResponseEntity<ResponseDTO> sendSelectionEmail(@RequestBody Map<String, String> selectionDetails)
            throws Exception {
        return new ResponseEntity<>(userService.sendSelectionEmail(selectionDetails), HttpStatus.OK);
    }

    @PostMapping("/invitation-email")
    public ResponseEntity<ResponseDTO> sendInvitationEmail(@RequestBody Map<String, String> invitationDetails)
            throws Exception {
        return new ResponseEntity<>(userService.sendInvitationEmail(invitationDetails), HttpStatus.OK);
    }

    @PostMapping("/interview-email")
    public ResponseEntity<ResponseDTO> sendInterviewEmail(@RequestBody Map<String, String> interviewDetails)
            throws Exception {
        return new ResponseEntity<>(userService.sendInterviewEmail(interviewDetails), HttpStatus.OK);
    }

}
