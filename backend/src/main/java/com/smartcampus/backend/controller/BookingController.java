package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.*;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingController(BookingRepository bookingRepository,
                             UserRepository userRepository,
                             NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * POST /api/bookings — user creates a new booking (goes to PENDING)
     */
    @PostMapping
    public ResponseEntity<Booking> createBooking(@AuthenticationPrincipal User user,
                                                  @RequestBody Map<String, String> body) {
        Booking booking = new Booking();
        booking.setUserId(user.getId());
        booking.setTitle(body.get("title"));
        booking.setDescription(body.get("description"));
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    /**
     * GET /api/bookings — get current user's bookings
     */
    @GetMapping
    public ResponseEntity<List<Booking>> getMyBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    /**
     * GET /api/bookings/all — admin gets all bookings with user names
     */
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> enriched = bookings.stream().map(b -> {
            String userName = userRepository.findById(b.getUserId())
                    .map(User::getName).orElse("Unknown");
            return Map.<String, Object>of(
                    "id", b.getId(),
                    "userId", b.getUserId(),
                    "userName", userName,
                    "title", b.getTitle(),
                    "description", b.getDescription() != null ? b.getDescription() : "",
                    "status", b.getStatus().name(),
                    "createdAt", b.getCreatedAt().toString()
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(enriched);
    }

    /**
     * PUT /api/bookings/{id}/status — admin approves or rejects a booking → notification to user
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable String id,
                                                        @RequestBody Map<String, String> body) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        String newStatus = body.get("status");
        booking.setStatus(BookingStatus.valueOf(newStatus));
        bookingRepository.save(booking);

        // Send notification to the user
        NotificationType type = newStatus.equals("APPROVED")
                ? NotificationType.BOOKING_APPROVED
                : NotificationType.BOOKING_REJECTED;

        String message = "Your booking \"" + booking.getTitle() + "\" has been "
                + newStatus.toLowerCase() + ".";

        notificationService.createNotification(booking.getUserId(), message, type, booking.getId());

        return ResponseEntity.ok(booking);
    }

    /**
     * DELETE /api/bookings/{id} — delete a booking
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBooking(@PathVariable String id) {
        bookingRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Booking deleted"));
    }
}
