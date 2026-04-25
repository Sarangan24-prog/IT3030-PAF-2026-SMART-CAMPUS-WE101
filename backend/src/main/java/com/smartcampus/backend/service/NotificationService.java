package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.NotificationType;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.NotificationRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class NotificationService {

    private static final Map<NotificationType, String> TYPE_TO_CATEGORY = Map.of(
        NotificationType.BOOKING_APPROVED,      "BOOKINGS",
        NotificationType.BOOKING_REJECTED,      "BOOKINGS",
        NotificationType.NEW_BOOKING_REQUEST,   "BOOKINGS",
        NotificationType.TICKET_STATUS_CHANGED, "TICKETS",
        NotificationType.NEW_COMMENT,           "COMMENTS"
    );

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notification createNotification(String userId, String message,
                                           NotificationType type, String referenceId) {
        String category = TYPE_TO_CATEGORY.getOrDefault(type, "OTHER");
        User user = userRepository.findById(Objects.requireNonNull(userId)).orElse(null);
        if (user != null) {
            Map<String, Boolean> prefs = user.getNotificationPreferences();
            if (prefs != null && Boolean.FALSE.equals(prefs.get(category))) {
                return null;
            }
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(Objects.requireNonNull(notificationId, "notificationId must not be null"))
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(Objects.requireNonNull(notificationId, "notificationId must not be null"));
    }
}
