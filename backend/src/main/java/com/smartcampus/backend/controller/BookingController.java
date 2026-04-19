/*package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.*;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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

    @PostMapping
    public ResponseEntity<Booking> createBooking(@AuthenticationPrincipal User user,
                                                  @RequestBody Map<String, String> body) {
        Booking booking = new Booking();
        booking.setUserId(user.getId());
        booking.setTitle(body.getOrDefault("title", ""));
        booking.setDescription(body.getOrDefault("description", ""));
        booking.setResourceType(body.getOrDefault("resourceType", ""));
        booking.setBookingDate(body.getOrDefault("bookingDate", ""));
        booking.setTimeSlot(body.getOrDefault("timeSlot", ""));
        booking.setPurpose(body.getOrDefault("purpose", ""));
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        saved.setReferenceId("BK-" + saved.getId().substring(saved.getId().length() - 6).toUpperCase());
        bookingRepository.save(saved);

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getMyBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> enriched = bookings.stream().map(b -> {
            String userName = userRepository.findById(b.getUserId())
                    .map(User::getName).orElse("Unknown");
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getId());
            map.put("userId", b.getUserId());
            map.put("userName", userName);
            map.put("title", b.getTitle() != null ? b.getTitle() : "");
            map.put("description", b.getDescription() != null ? b.getDescription() : "");
            map.put("resourceType", b.getResourceType() != null ? b.getResourceType() : "");
            map.put("bookingDate", b.getBookingDate() != null ? b.getBookingDate() : "");
            map.put("timeSlot", b.getTimeSlot() != null ? b.getTimeSlot() : "");
            map.put("purpose", b.getPurpose() != null ? b.getPurpose() : "");
            map.put("referenceId", b.getReferenceId() != null ? b.getReferenceId() : "");
            map.put("status", b.getStatus().name());
            map.put("createdAt", b.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(enriched);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable String id,
                                                        @RequestBody Map<String, String> body) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        String newStatus = body.get("status");
        booking.setStatus(BookingStatus.valueOf(newStatus));
        bookingRepository.save(booking);

        NotificationType type = newStatus.equals("APPROVED")
                ? NotificationType.BOOKING_APPROVED
                : NotificationType.BOOKING_REJECTED;

        String refPart = booking.getReferenceId() != null ? " (" + booking.getReferenceId() + ")" : "";
        String message = "Your booking \"" + booking.getTitle() + "\"" + refPart
                + " has been " + newStatus.toLowerCase() + ".";

        notificationService.createNotification(booking.getUserId(), message, type, booking.getId());

        return ResponseEntity.ok(booking);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBooking(@PathVariable String id) {
        bookingRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Booking deleted"));
    }
}
*/package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.*;
import com.smartcampus.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /**
     * POST /api/bookings
     * User creates a booking request
     */
    @PostMapping
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        try {
            Booking booking = new Booking();
            booking.setUserId(user.getId());
            booking.setUserName(user.getName());
            booking.setTitle(body.getOrDefault("title", ""));
            booking.setDescription(body.getOrDefault("description", ""));
            booking.setResourceType(body.getOrDefault("resourceType", ""));
            booking.setResourceId(body.getOrDefault("resourceId", ""));
            booking.setResourceName(body.getOrDefault("resourceName", ""));
            booking.setLocation(body.getOrDefault("location", ""));
            booking.setBookingDate(body.getOrDefault("bookingDate", ""));
            booking.setTimeSlot(body.getOrDefault("timeSlot", ""));
            booking.setStartTime(body.getOrDefault("startTime", ""));
            booking.setEndTime(body.getOrDefault("endTime", ""));
            booking.setPurpose(body.getOrDefault("purpose", ""));
            booking.setExpectedAttendees(
                Integer.parseInt(body.getOrDefault("expectedAttendees", "0"))
            );

            Booking saved = bookingService.createBooking(booking);

            // Generate reference ID
            saved.setReferenceId("BK-" + saved.getId()
                .substring(saved.getId().length() - 6).toUpperCase());

            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/bookings
     * User gets their own bookings
     */
    @GetMapping
    public ResponseEntity<List<Booking>> getMyBookings(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
            bookingService.getMyBookings(user.getId())
        );
    }

    /**
     * GET /api/bookings/all
     * Admin gets all bookings
     */
    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(
            bookingService.getAllBookings()
        );
    }

    /**
     * GET /api/bookings/status/{status}
     * Admin filters bookings by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(
            bookingService.getBookingsByStatus(
                BookingStatus.valueOf(status)
            )
        );
    }

    /**
     * PUT /api/bookings/{id}/status
     * Admin approves or rejects a booking
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable String id,
            @AuthenticationPrincipal User admin,
            @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            String reason = body.getOrDefault("reason", "");

            Booking updated = bookingService.updateStatus(
                id, status, reason, admin.getName()
            );
            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/bookings/{id}
     * User cancels their own booking
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        try {
            bookingService.cancelBooking(id, user.getId());
            return ResponseEntity.ok(
                Map.of("message", "Booking cancelled successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }
}