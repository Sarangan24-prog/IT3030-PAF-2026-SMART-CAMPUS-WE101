package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.security.JwtUtil;
import com.smartcampus.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * GET /api/auth/me — returns the currently authenticated user's info
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(user);
    }

    /**
     * POST /api/auth/demo-login — for development/testing without Google OAuth.
     * Creates or finds a demo user and returns a JWT token.
     * Admin emails (containing "admin") get ADMIN role automatically.
     */
    @PostMapping("/demo-login")
    public ResponseEntity<?> demoLogin(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "demo@smartcampus.com");
        String name = body.getOrDefault("name", "Demo User");

        User user = userService.getUserByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setGoogleId("demo-" + email);

                    // Auto-assign ADMIN role if email contains "admin"
                    if (email.toLowerCase().contains("admin")) {
                        newUser.setRole(Role.ADMIN);
                    }

                    return userService.saveUser(newUser);
                });

        // Fix existing users: upgrade to ADMIN if admin email but wrong role
        if (email.toLowerCase().contains("admin") && user.getRole() != Role.ADMIN) {
            user.setRole(Role.ADMIN);
            user = userService.saveUser(user);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", user
        ));
    }
}
