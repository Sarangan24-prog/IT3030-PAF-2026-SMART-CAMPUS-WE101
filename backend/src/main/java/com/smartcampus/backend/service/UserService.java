package com.smartcampus.backend.service;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    public Optional<User> getUserByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUserRole(String userId, Role role) {
        User user = userRepository.findById(Objects.requireNonNull(userId, "userId must not be null"))
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return userRepository.save(user);
    }

    @SuppressWarnings("null")
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Map<String, Boolean> getNotificationPreferences(String userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Boolean> prefs = user.getNotificationPreferences();
        if (prefs == null || prefs.isEmpty()) {
            return new HashMap<>(Map.of("BOOKINGS", true, "TICKETS", true, "COMMENTS", true));
        }
        return prefs;
    }

    public Map<String, Boolean> updateNotificationPreferences(String userId, Map<String, Boolean> preferences) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setNotificationPreferences(preferences);
        userRepository.save(user);
        return preferences;
    }
}
