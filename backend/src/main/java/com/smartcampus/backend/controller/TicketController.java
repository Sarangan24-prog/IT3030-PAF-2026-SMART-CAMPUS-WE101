package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.*;
import com.smartcampus.backend.repository.TicketRepository;
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
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketController(TicketRepository ticketRepository,
                            UserRepository userRepository,
                            NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * POST /api/tickets — user raises a new ticket
     */
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@AuthenticationPrincipal User user,
                                                @RequestBody Map<String, String> body) {
        Ticket ticket = new Ticket();
        ticket.setUserId(user.getId());
        ticket.setTitle(body.get("title"));
        ticket.setDescription(body.get("description"));
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);
        return ResponseEntity.ok(saved);
    }

    /**
     * GET /api/tickets — get current user's tickets
     */
    @GetMapping
    public ResponseEntity<List<Ticket>> getMyTickets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    /**
     * GET /api/tickets/all — admin gets all tickets with user names
     */
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> enriched = tickets.stream().map(t -> {
            String userName = userRepository.findById(t.getUserId())
                    .map(User::getName).orElse("Unknown");
            return Map.<String, Object>of(
                    "id", t.getId(),
                    "userId", t.getUserId(),
                    "userName", userName,
                    "title", t.getTitle(),
                    "description", t.getDescription() != null ? t.getDescription() : "",
                    "status", t.getStatus().name(),
                    "comments", t.getComments(),
                    "createdAt", t.getCreatedAt().toString()
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(enriched);
    }

    /**
     * PUT /api/tickets/{id}/status — admin changes ticket status → notification to user
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable String id,
                                                      @RequestBody Map<String, String> body) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String newStatus = body.get("status");
        ticket.setStatus(TicketStatus.valueOf(newStatus));
        ticketRepository.save(ticket);

        // Notify user about status change
        String message = "Your ticket \"" + ticket.getTitle() + "\" status changed to "
                + newStatus.replace("_", " ") + ".";
        notificationService.createNotification(
                ticket.getUserId(), message, NotificationType.TICKET_STATUS_CHANGED, ticket.getId()
        );

        return ResponseEntity.ok(ticket);
    }

    /**
     * POST /api/tickets/{id}/comments — add a comment → notification to ticket owner
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> addComment(@PathVariable String id,
                                              @AuthenticationPrincipal User user,
                                              @RequestBody Map<String, String> body) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Comment comment = new Comment();
        comment.setAuthorId(user.getId());
        comment.setAuthorName(user.getName());
        comment.setText(body.get("text"));
        comment.setCreatedAt(LocalDateTime.now());
        ticket.getComments().add(comment);
        ticketRepository.save(ticket);

        // Notify ticket owner if commenter is not the owner
        if (!ticket.getUserId().equals(user.getId())) {
            String message = user.getName() + " commented on your ticket \"" + ticket.getTitle() + "\".";
            notificationService.createNotification(
                    ticket.getUserId(), message, NotificationType.NEW_COMMENT, ticket.getId()
            );
        }

        return ResponseEntity.ok(ticket);
    }

    /**
     * DELETE /api/tickets/{id} — delete a ticket
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTicket(@PathVariable String id) {
        ticketRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Ticket deleted"));
    }
}
