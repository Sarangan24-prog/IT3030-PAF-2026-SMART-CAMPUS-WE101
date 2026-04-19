package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.*;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@AuthenticationPrincipal User user,
                                                @RequestBody Map<String, String> body) {
        Ticket ticket = new Ticket();
        ticket.setUserId(user.getId());
        ticket.setTitle(body.getOrDefault("title", ""));
        ticket.setDescription(body.getOrDefault("description", ""));
        ticket.setCategory(body.getOrDefault("category", ""));
        ticket.setLocation(body.getOrDefault("location", ""));
        ticket.setPriority(body.getOrDefault("priority", "MEDIUM"));
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        saved.setReferenceId("TK-" + saved.getId().substring(saved.getId().length() - 6).toUpperCase());
        ticketRepository.save(saved);

        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getMyTickets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> enriched = tickets.stream().map(t -> {
            String userName = "Unknown";
            String ticketUserId = t.getUserId();
            if (ticketUserId != null) {
                userName = userRepository.findById(ticketUserId)
                .map(User::getName)
                .orElse("Unknown");
            }
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("userId", t.getUserId());
            map.put("userName", userName);
            map.put("title", t.getTitle() != null ? t.getTitle() : "");
            map.put("description", t.getDescription() != null ? t.getDescription() : "");
            map.put("category", t.getCategory() != null ? t.getCategory() : "");
            map.put("location", t.getLocation() != null ? t.getLocation() : "");
            map.put("priority", t.getPriority() != null ? t.getPriority() : "MEDIUM");
            map.put("referenceId", t.getReferenceId() != null ? t.getReferenceId() : "");
            map.put("status", t.getStatus().name());
            map.put("comments", t.getComments());
            map.put("createdAt", t.getCreatedAt().toString());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(enriched);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable String id,
                                                      @RequestBody Map<String, String> body) {
        Ticket ticket = ticketRepository.findById(Objects.requireNonNull(id, "id must not be null"))
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String newStatus = body.get("status");
        ticket.setStatus(TicketStatus.valueOf(newStatus));
        ticketRepository.save(ticket);

        String refPart = ticket.getReferenceId() != null ? " (" + ticket.getReferenceId() + ")" : "";
        String message = "Your ticket \"" + ticket.getTitle() + "\"" + refPart
                + " status changed to " + newStatus.replace("_", " ") + ".";
        notificationService.createNotification(
                ticket.getUserId(), message, NotificationType.TICKET_STATUS_CHANGED, ticket.getId()
        );

        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/feedback")
    public ResponseEntity<Ticket> addFeedback(@PathVariable String id,
                                               @RequestBody Map<String, String> body) {
        Ticket ticket = ticketRepository.findById(Objects.requireNonNull(id, "id must not be null"))
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        try {
            ticket.setRating(Integer.parseInt(body.get("rating")));
        } catch (NumberFormatException ignored) {}
        if (body.get("feedback") != null) {
            ticket.setFeedback(body.get("feedback"));
        }
        ticket.setStatus(TicketStatus.CLOSED);
        ticketRepository.save(ticket);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> addComment(@PathVariable String id,
                                              @AuthenticationPrincipal User user,
                                              @RequestBody Map<String, String> body) {
        Ticket ticket = ticketRepository.findById(Objects.requireNonNull(id, "id must not be null"))
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Comment comment = new Comment();
        comment.setAuthorId(user.getId());
        comment.setAuthorName(user.getName());
        comment.setText(body.get("text"));
        comment.setCreatedAt(LocalDateTime.now());
        ticket.getComments().add(comment);
        ticketRepository.save(ticket);

        if (!ticket.getUserId().equals(user.getId())) {
            String message = user.getName() + " commented on your ticket \"" + ticket.getTitle() + "\".";
            notificationService.createNotification(
                    ticket.getUserId(), message, NotificationType.NEW_COMMENT, ticket.getId()
            );
        }

        return ResponseEntity.ok(ticket);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTicket(@PathVariable String id) {
        ticketRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
        return ResponseEntity.ok(Map.of("message", "Ticket deleted"));
    }
}
