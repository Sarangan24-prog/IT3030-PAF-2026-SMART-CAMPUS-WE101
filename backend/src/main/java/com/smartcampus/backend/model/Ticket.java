package com.smartcampus.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String userId;
    private String title;
    private String description;
    private String category;
    private String location;
    private String priority = "MEDIUM";
    private String referenceId;
    private Integer rating;
    private String feedback;
    private TicketStatus status = TicketStatus.OPEN;
    private List<Comment> comments = new ArrayList<>();
    private String contactDetails;
    private String technicianId;
    private String technicianName;
    private List<String> attachments = new ArrayList<>();
    private List<StatusHistory> history = new ArrayList<>();
    private LocalDateTime resolvedAt;
    private LocalDateTime firstResponseAt;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Ticket() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String contactDetails) { this.contactDetails = contactDetails; }

    public String getTechnicianId() { return technicianId; }
    public void setTechnicianId(String technicianId) { this.technicianId = technicianId; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public List<String> getAttachments() { return attachments; }
    public void setAttachments(List<String> attachments) { this.attachments = attachments; }

    public List<StatusHistory> getHistory() { return history; }
    public void setHistory(List<StatusHistory> history) { this.history = history; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public LocalDateTime getFirstResponseAt() { return firstResponseAt; }
    public void setFirstResponseAt(LocalDateTime firstResponseAt) { this.firstResponseAt = firstResponseAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
