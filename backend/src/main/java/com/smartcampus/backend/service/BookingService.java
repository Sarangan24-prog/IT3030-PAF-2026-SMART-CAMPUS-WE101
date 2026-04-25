package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.model.NotificationType;
import com.smartcampus.backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    // ── Create booking with conflict check ───────────────
    public Booking createBooking(Booking booking) {

        // Check for conflicts before saving
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            booking.getResourceId(),
            booking.getBookingDate(),
            booking.getStartTime(),
            booking.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException(
                "This resource is already booked for the selected time slot!"
            );
        }

        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify that a new booking request is pending
        String message = "New booking request from " + saved.getUserName() 
            + " for " + saved.getResourceType() + " on " + saved.getBookingDate();
        notificationService.createNotification(
            saved.getUserId(), message, NotificationType.NEW_BOOKING_REQUEST, saved.getId()
        );

        return saved;
       booking.setStatus(BookingStatus.PENDING);
booking.setCreatedAt(LocalDateTime.now());

// Save first to get ID
Booking saved = bookingRepository.save(booking);

// Generate and save referenceId
saved.setReferenceId("BK-" + saved.getId()
    .substring(saved.getId().length() - 6).toUpperCase());
bookingRepository.save(saved); // save again with referenceId

return saved;
    }

    // ── Get bookings for one user ─────────────────────────
    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ── Get all bookings (admin) ──────────────────────────
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    // ── Approve or Reject booking ─────────────────────────
    public Booking updateStatus(String id, String status, String reason, String adminName) {

        Booking booking = bookingRepository.findById(Objects.requireNonNull(id, "id must not be null"))
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Cannot update a cancelled booking
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot update a cancelled booking");
        }

        booking.setStatus(BookingStatus.valueOf(status));
        booking.setAdminReason(reason);
        booking.setApprovedBy(adminName);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Send notification to user
        NotificationType type = status.equals("APPROVED")
            ? NotificationType.BOOKING_APPROVED
            : NotificationType.BOOKING_REJECTED;

        String refPart = booking.getReferenceId() != null
            ? " (" + booking.getReferenceId() + ")" : "";
        String message = "Your booking \"" + booking.getTitle() + "\"" + refPart
            + " has been " + status.toLowerCase() + ".";
        if (reason != null && !reason.isEmpty()) {
            message += " Reason: " + reason;
        }

        notificationService.createNotification(
            booking.getUserId(), message, type, booking.getId()
        );

        return booking;
    }

    // ── Cancel booking ────────────────────────────────────
    public void cancelBooking(String id, String userId) {

        Booking booking = bookingRepository.findById(Objects.requireNonNull(id, "id must not be null"))
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Only owner can cancel
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        // Cannot cancel rejected booking
        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new RuntimeException("Cannot cancel a rejected booking");
        }

        bookingRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }

    // ── Filter by status (admin) ──────────────────────────
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatusOrderByCreatedAtDesc(status);
    }
}
