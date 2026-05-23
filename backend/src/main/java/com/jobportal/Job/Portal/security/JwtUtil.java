package com.jobportal.Job.Portal.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret:changeit}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms:86400000}")
    private Long jwtExpirationMs;

    public String generateToken(String subject) {
        Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
        return JWT.create()
                .withSubject(subject)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .sign(algorithm);
    }

    public String getUsernameFromToken(String token) {
        try {
            DecodedJWT decodedJWT = getVerifier().verify(token.replace("Bearer ", ""));
            return decodedJWT.getSubject();
        } catch (JWTVerificationException e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            getVerifier().verify(token.replace("Bearer ", ""));
            return true;
        } catch (JWTVerificationException e) {
            return false;
        }
    }

    private JWTVerifier getVerifier() {
        Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());
        return JWT.require(algorithm).build();
    }
}
