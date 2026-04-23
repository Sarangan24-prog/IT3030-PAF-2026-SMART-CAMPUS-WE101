package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.*;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.UserRepository;
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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

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
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getMyBookings(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
            bookingService.getMyBookings(user.getId())
        );
    }

    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(
            bookingService.getAllBookings()
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(
            bookingService.getBookingsByStatus(
                BookingStatus.valueOf(status)
            )
        );
    }

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

    @GetMapping("/verify/{referenceId}")
    public ResponseEntity<?> verifyBooking(
            @PathVariable String referenceId) {
        try {
            Booking booking = bookingRepository
                .findByReferenceId(referenceId);
            if (booking == null) {
                booking = bookingRepository
                    .findById(referenceId).orElse(null);
            }
            if (booking == null) {
                return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Booking not found"));
            }
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Booking not found"));
        }
    }
}