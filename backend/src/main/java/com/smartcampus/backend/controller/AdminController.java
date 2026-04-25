package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.NotificationType;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.NotificationRepository;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public AdminController(UserRepository userRepository,
                           NotificationRepository notificationRepository,
                           ResourceRepository resourceRepository,
                           BookingRepository bookingRepository,
                           NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
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
     * GET /api/admin/resource-analytics — resource inventory and booking intelligence
     */
    @GetMapping("/resource-analytics")
    public ResponseEntity<Map<String, Object>> getResourceAnalytics() {
        List<Resource> resources = resourceRepository.findAll();
        List<Booking> bookings = bookingRepository.findAll();

        long totalResources = resources.size();
        long activeResources = resources.stream()
                .filter(r -> r.getStatus() != null && "ACTIVE".equals(r.getStatus().name()))
                .count();
        long outOfServiceResources = resources.stream()
                .filter(r -> r.getStatus() != null && "OUT_OF_SERVICE".equals(r.getStatus().name()))
                .count();
        long bookableResources = resources.stream()
                .filter(r -> Boolean.TRUE.equals(r.getBookable()))
                .count();
        int totalCapacity = resources.stream()
                .map(Resource::getCapacity)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();
        long approvedBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .count();
        long pendingBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING)
                .count();
        long rejectedBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.REJECTED)
                .count();
        long cancelledBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                .count();

        int healthScore = totalResources == 0
                ? 0
                : (int) Math.round((activeResources * 100.0) / totalResources);
        int bookableRatio = totalResources == 0
                ? 0
                : (int) Math.round((bookableResources * 100.0) / totalResources);
        int utilizationScore = activeResources == 0
                ? 0
                : (int) Math.min(100, Math.round((approvedBookings * 100.0) / (activeResources * 8.0)));

        Map<String, Long> byType = resources.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getType() != null ? r.getType().name() : "UNCLASSIFIED",
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        Map<String, Long> byStatus = resources.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getStatus() != null ? r.getStatus().name() : "UNKNOWN",
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        Map<String, Long> byBuilding = resources.stream()
                .collect(Collectors.groupingBy(
                        r -> isPresent(r.getBuilding()) ? r.getBuilding() : "Unassigned",
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        Map<String, Long> bookingsByStatus = bookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getStatus() != null ? b.getStatus().name() : "UNKNOWN",
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        List<Map<String, Object>> topResources = buildTopResources(resources, bookings);
        List<Map<String, Object>> capacityBands = buildCapacityBands(resources);
        List<Map<String, Object>> recentBookings = bookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(6)
                .map(b -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", b.getId());
                    item.put("referenceId", isPresent(b.getReferenceId()) ? b.getReferenceId() : "N/A");
                    item.put("resourceName", isPresent(b.getResourceName()) ? b.getResourceName() : b.getResourceType());
                    item.put("userName", isPresent(b.getUserName()) ? b.getUserName() : "Unknown");
                    item.put("status", b.getStatus() != null ? b.getStatus().name() : "UNKNOWN");
                    item.put("bookingDate", b.getBookingDate());
                    item.put("timeSlot", isPresent(b.getTimeSlot()) ? b.getTimeSlot() : joinTimes(b.getStartTime(), b.getEndTime()));
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalResources", totalResources);
        summary.put("activeResources", activeResources);
        summary.put("outOfServiceResources", outOfServiceResources);
        summary.put("bookableResources", bookableResources);
        summary.put("totalCapacity", totalCapacity);
        summary.put("totalBookings", bookings.size());
        summary.put("approvedBookings", approvedBookings);
        summary.put("pendingBookings", pendingBookings);
        summary.put("rejectedBookings", rejectedBookings);
        summary.put("cancelledBookings", cancelledBookings);
        summary.put("healthScore", healthScore);
        summary.put("bookableRatio", bookableRatio);
        summary.put("utilizationScore", utilizationScore);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("summary", summary);
        response.put("byType", byType);
        response.put("byStatus", byStatus);
        response.put("byBuilding", byBuilding);
        response.put("bookingsByStatus", bookingsByStatus);
        response.put("capacityBands", capacityBands);
        response.put("topResources", topResources);
        response.put("recentBookings", recentBookings);

        return ResponseEntity.ok(response);
    }

    private List<Map<String, Object>> buildTopResources(List<Resource> resources, List<Booking> bookings) {
        Map<String, Long> bookingCounts = bookings.stream()
                .filter(b -> isPresent(b.getResourceId()))
                .collect(Collectors.groupingBy(Booking::getResourceId, Collectors.counting()));

        return resources.stream()
                .map(resource -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", resource.getId());
                    item.put("code", resource.getCode());
                    item.put("name", resource.getName());
                    item.put("building", resource.getBuilding());
                    item.put("type", resource.getType() != null ? resource.getType().name() : "UNCLASSIFIED");
                    item.put("capacity", resource.getCapacity() != null ? resource.getCapacity() : 0);
                    item.put("bookingCount", bookingCounts.getOrDefault(resource.getId(), 0L));
                    return item;
                })
                .sorted((a, b) -> Long.compare(
                        ((Number) b.get("bookingCount")).longValue(),
                        ((Number) a.get("bookingCount")).longValue()
                ))
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildCapacityBands(List<Resource> resources) {
        List<Map<String, Object>> bands = new ArrayList<>();
        bands.add(capacityBand("Small", resources, 0, 40));
        bands.add(capacityBand("Medium", resources, 41, 120));
        bands.add(capacityBand("Large", resources, 121, 300));
        bands.add(capacityBand("Arena", resources, 301, Integer.MAX_VALUE));
        return bands;
    }

    private Map<String, Object> capacityBand(String label, List<Resource> resources, int min, int max) {
        long count = resources.stream()
                .filter(r -> {
                    int capacity = r.getCapacity() != null ? r.getCapacity() : 0;
                    return capacity >= min && capacity <= max;
                })
                .count();
        Map<String, Object> band = new LinkedHashMap<>();
        band.put("label", label);
        band.put("count", count);
        return band;
    }

    private String joinTimes(String start, String end) {
        if (isPresent(start) && isPresent(end)) {
            return start + " - " + end;
        }
        return "TBA";
    }

    private static boolean isPresent(String value) {
        return value != null && !value.isBlank();
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
