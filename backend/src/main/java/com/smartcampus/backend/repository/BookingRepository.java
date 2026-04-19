package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    
    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Booking> findAllByOrderByCreatedAtDesc();

    // ──  new methods (added by Sarangan) ──────────────

    // Conflict detection query
    @Query("{ 'resourceId': ?0, " +
               "'bookingDate': ?1, " +
               "'status': 'APPROVED', " +
               "'startTime': { $lt: ?3 }, " +
               "'endTime':   { $gt: ?2 } }")
    List<Booking> findConflictingBookings(
        String resourceId,
        String bookingDate,
        String startTime,
        String endTime
    );

    // Filter by status
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    // Filter by resource
    List<Booking> findByResourceIdOrderByBookingDateAsc(String resourceId);

    // Filter by date
    List<Booking> findByBookingDateOrderByStartTimeAsc(String bookingDate);

    // Count by status - for admin dashboard
    long countByStatus(BookingStatus status);
}