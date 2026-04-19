package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.NotificationType;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.NotificationRepository;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public AdminController(UserRepository userRepository,
                           NotificationRepository notificationRepository,
                           NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }

    /**
     * GET /api/admin/stats — dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalUsers = userRepository.count();
        long totalNotifications = notificationRepository.count();

        List<User> allUsers = userRepository.findAll();
        Map<String, Long> roleCounts = allUsers.stream()
                .collect(Collectors.groupingBy(
                        u -> u.getRole().name(),
                        Collectors.counting()
                ));

        long unreadNotifications = notificationRepository.findAll().stream()
                .filter(n -> !n.isRead())
                .count();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalNotifications", totalNotifications,
                "unreadNotifications", unreadNotifications,
                "roleCounts", roleCounts
        ));
    }

    /**
     * GET /api/admin/notifications — get ALL notifications (admin view)
     */
    @GetMapping("/notifications")
    public ResponseEntity<List<Map<String, Object>>> getAllNotifications() {
        List<Notification> notifications = notificationRepository.findAll();
        // Sort by createdAt descending
        notifications.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        // Enrich with user name
        List<Map<String, Object>> enriched = notifications.stream().map(n -> {
            String userName = "Unknown";
            String notificationUserId = n.getUserId();
            if (notificationUserId != null) {
                userName = userRepository.findById(notificationUserId)
                        .map(User::getName)
                        .orElse("Unknown");
            }
            return Map.<String, Object>of(
                    "id", n.getId(),
                    "userId", n.getUserId(),
                    "userName", userName,
                    "message", n.getMessage(),
                    "type", n.getType().name(),
                    "isRead", n.isRead(),
                    "createdAt", n.getCreatedAt().toString(),
                    "referenceId", n.getReferenceId() != null ? n.getReferenceId() : ""
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(enriched);
    }

    /**
     * POST /api/admin/notifications — admin sends a notification to a user
     */
    @PostMapping("/notifications")
    public ResponseEntity<Notification> sendNotification(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String message = body.get("message");
        String typeStr = body.getOrDefault("type", "NEW_COMMENT");

        NotificationType type;
        try {
            type = NotificationType.valueOf(typeStr);
        } catch (IllegalArgumentException e) {
            type = NotificationType.NEW_COMMENT;
        }

        Notification notification = notificationService.createNotification(
                userId, message, type, ""
        );
        return ResponseEntity.ok(notification);
    }

    /**
     * POST /api/admin/notifications/broadcast — send notification to ALL users
     */
    @PostMapping("/notifications/broadcast")
    public ResponseEntity<Map<String, String>> broadcastNotification(@RequestBody Map<String, String> body) {
        String message = body.get("message");
        String typeStr = body.getOrDefault("type", "NEW_COMMENT");

        NotificationType type;
        try {
            type = NotificationType.valueOf(typeStr);
        } catch (IllegalArgumentException e) {
            type = NotificationType.NEW_COMMENT;
        }

        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            notificationService.createNotification(user.getId(), message, type, "");
        }

        return ResponseEntity.ok(Map.of(
                "message", "Notification sent to " + allUsers.size() + " users"
        ));
    }
}
