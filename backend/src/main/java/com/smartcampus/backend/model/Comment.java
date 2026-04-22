package com.smartcampus.backend.model;

import java.time.LocalDateTime;

public class Comment {

    private String id = java.util.UUID.randomUUID().toString();
    private String authorId;
    private String authorName;
    private String text;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Comment() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
