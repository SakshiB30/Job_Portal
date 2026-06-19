package com.jobportal.Job.Portal.security;

import com.jobportal.Job.Portal.entity.User;
import com.jobportal.Job.Portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        List<GrantedAuthority> authorities = new ArrayList<>();
        String role = user.getAccountType() == null ? "USER" : "ROLE_" + user.getAccountType().name();
        authorities.add(new SimpleGrantedAuthority(role));
        boolean enabled = user.getBlocked() == null || !user.getBlocked();
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), enabled, true, true, true, authorities);
    }
}
