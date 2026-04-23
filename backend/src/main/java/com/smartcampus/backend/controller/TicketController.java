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
                                                @RequestBody Map<String, Object> body) {
        Ticket ticket = new Ticket();
        ticket.setUserId(user.getId());
        ticket.setTitle((String) body.getOrDefault("title", ""));
        ticket.setDescription((String) body.getOrDefault("description", ""));
        ticket.setCategory((String) body.getOrDefault("category", ""));
        ticket.setLocation((String) body.getOrDefault("location", ""));
        ticket.setPriority((String) body.getOrDefault("priority", "MEDIUM"));
        ticket.setContactDetails((String) body.getOrDefault("contactDetails", ""));
        
        // Handle attachments (Max 3)
        if (body.get("attachments") instanceof List) {
            List<?> rawList = (List<?>) body.get("attachments");
            List<String> attachments = rawList.stream()
                    .limit(3)
                    .map(Object::toString)
                    .collect(Collectors.toList());
            ticket.setAttachments(attachments);
        }

        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        
        // Initial history entry
        ticket.getHistory().add(new StatusHistory(null, TicketStatus.OPEN, user.getId(), user.getName(), "Ticket created"));

        Ticket saved = ticketRepository.save(ticket);
        saved.setReferenceId("TK-" + saved.getId().substring(saved.getId().length() - 6).toUpperCase());
        ticketRepository.save(saved);

        return ResponseEntity.ok(saved);
    }

    private void recordStatusChange(Ticket ticket, TicketStatus nextStatus, User actor, String notes) {
        StatusHistory history = new StatusHistory(
                ticket.getStatus(),
                nextStatus,
                actor.getId(),
                actor.getName(),
                notes
        );
        ticket.getHistory().add(history);
        
        // Track First Response: If status moves from OPEN and not by the ticket owner
        if (ticket.getStatus() == TicketStatus.OPEN && !ticket.getUserId().equals(actor.getId())) {
            if (ticket.getFirstResponseAt() == null) {
                ticket.setFirstResponseAt(LocalDateTime.now());
            }
        }
        
        ticket.setStatus(nextStatus);
        if (nextStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
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
            map.put("firstResponseAt", t.getFirstResponseAt() != null ? t.getFirstResponseAt().toString() : null);
            map.put("resolvedAt", t.getResolvedAt() != null ? t.getResolvedAt().toString() : null);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(enriched);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable String id,
                                                      @AuthenticationPrincipal User user,
                                                      @RequestBody Map<String, String> body) {
        Ticket ticket = ticketRepository.findById(Objects.requireNonNull(id, "id must not be null"))
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketStatus nextStatus = TicketStatus.valueOf(body.get("status"));
        String notes = body.getOrDefault("notes", "Status updated by admin");
        
        recordStatusChange(ticket, nextStatus, user, notes);
        ticketRepository.save(ticket);

        String refPart = ticket.getReferenceId() != null ? " (" + ticket.getReferenceId() + ")" : "";
        String message = "Your ticket \"" + ticket.getTitle() + "\"" + refPart
                + " status changed to " + nextStatus.name().replace("_", " ") + ".";
        notificationService.createNotification(
                ticket.getUserId(), message, NotificationType.TICKET_STATUS_CHANGED, ticket.getId()
        );

        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(@PathVariable String id,
                                                    @AuthenticationPrincipal User admin,
                                                    @RequestBody Map<String, String> body) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        String techId = body.get("technicianId");
        String techName = body.get("technicianName");
        
        ticket.setTechnicianId(techId);
        ticket.setTechnicianName(techName);
        
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
        }

        String notes = "Assigned to " + techName;
        ticket.getHistory().add(new StatusHistory(ticket.getStatus(), ticket.getStatus(), admin.getId(), admin.getName(), notes));
        
        ticketRepository.save(ticket);
        
        // Notify user
        notificationService.createNotification(ticket.getUserId(), "Technician " + techName + " has been assigned to your ticket.", 
                NotificationType.TICKET_STATUS_CHANGED, ticket.getId());
                
        // Notify technician
        notificationService.createNotification(techId, "You have been assigned to ticket \"" + ticket.getTitle() + "\".", 
                NotificationType.TICKET_STATUS_CHANGED, ticket.getId());

        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Ticket> resolveTicket(@PathVariable String id,
                                                 @AuthenticationPrincipal User actor,
                                                 @RequestBody Map<String, String> body) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        String notes = body.getOrDefault("notes", "No resolution notes provided.");
        recordStatusChange(ticket, TicketStatus.RESOLVED, actor, "Resolved: " + notes);
        
        ticketRepository.save(ticket);
        
        notificationService.createNotification(ticket.getUserId(), "Your ticket has been RESOLVED. Please provide feedback.", 
                NotificationType.TICKET_STATUS_CHANGED, ticket.getId());
                
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

        if (ticket.getFirstResponseAt() == null && !ticket.getUserId().equals(user.getId())) {
            ticket.setFirstResponseAt(LocalDateTime.now());
        }

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

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Ticket> editComment(@PathVariable String id,
                                               @PathVariable String commentId,
                                               @AuthenticationPrincipal User user,
                                               @RequestBody Map<String, String> body) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        Comment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You can only edit your own comments");
        }
        
        comment.setText(body.get("text"));
        ticketRepository.save(ticket);
        
        return ResponseEntity.ok(ticket);
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Ticket> deleteComment(@PathVariable String id,
                                                 @PathVariable String commentId,
                                                 @AuthenticationPrincipal User user) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        Comment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getAuthorId().equals(user.getId()) && !user.getRole().equals("ADMIN")) {
            throw new RuntimeException("Unauthorized: You can only delete your own comments");
        }
        
        ticket.getComments().remove(comment);
        ticketRepository.save(ticket);
        
        return ResponseEntity.ok(ticket);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTicket(@PathVariable String id) {
        ticketRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
        return ResponseEntity.ok(Map.of("message", "Ticket deleted"));
    }
}
