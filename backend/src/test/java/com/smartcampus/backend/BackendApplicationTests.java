package com.smartcampus.backend;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BackendApplicationTests {

    // ── Basic Spring Test ────────────────────────────
    @Test
    void contextLoads() {
    }

    // ── Sarangan - Booking Module Tests ─────────────

    @Test
    void testBookingDefaultStatus() {
        Booking booking = new Booking();
        assertEquals(BookingStatus.PENDING, booking.getStatus());
    }

    @Test
    void testBookingSetAndGetTitle() {
        Booking booking = new Booking();
        booking.setTitle("CS301 Lab Session");
        assertEquals("CS301 Lab Session", booking.getTitle());
    }

    @Test
    void testBookingSetAndGetUserId() {
        Booking booking = new Booking();
        booking.setUserId("user123");
        assertEquals("user123", booking.getUserId());
    }

    @Test
    void testBookingStatusChange() {
        Booking booking = new Booking();
        booking.setStatus(BookingStatus.APPROVED);
        assertEquals(BookingStatus.APPROVED, booking.getStatus());
    }

    @Test
    void testBookingReferenceId() {
        Booking booking = new Booking();
        booking.setReferenceId("BK-3C12DE");
        assertEquals("BK-3C12DE", booking.getReferenceId());
    }

    @Test
    void testBookingSetAndGetResourceType() {
        Booking booking = new Booking();
        booking.setResourceType("Lecture Hall");
        assertEquals("Lecture Hall", booking.getResourceType());
    }

    @Test
    void testBookingSetAndGetBookingDate() {
        Booking booking = new Booking();
        booking.setBookingDate("2026-04-28");
        assertEquals("2026-04-28", booking.getBookingDate());
    }

    @Test
    void testBookingSetAndGetStartTime() {
        Booking booking = new Booking();
        booking.setStartTime("08:00");
        assertEquals("08:00", booking.getStartTime());
    }

    @Test
    void testBookingSetAndGetEndTime() {
        Booking booking = new Booking();
        booking.setEndTime("10:00");
        assertEquals("10:00", booking.getEndTime());
    }

    @Test
    void testBookingCancelledStatus() {
        Booking booking = new Booking();
        booking.setStatus(BookingStatus.CANCELLED);
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
    }

    @Test
    void testBookingRejectedStatus() {
        Booking booking = new Booking();
        booking.setStatus(BookingStatus.REJECTED);
        assertNotEquals(BookingStatus.APPROVED, booking.getStatus());
    }

    @Test
    void testBookingSetAdminReason() {
        Booking booking = new Booking();
        booking.setAdminReason("Room not available");
        assertEquals("Room not available", booking.getAdminReason());
    }

    @Test
    void testBookingExpectedAttendees() {
        Booking booking = new Booking();
        booking.setExpectedAttendees(25);
        assertEquals(25, booking.getExpectedAttendees());
    }
}