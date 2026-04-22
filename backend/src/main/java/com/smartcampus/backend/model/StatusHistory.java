package com.smartcampus.backend.model;

import java.time.LocalDateTime;

public class StatusHistory {
    private TicketStatus fromStatus;
    private TicketStatus toStatus;
    private String changedBy;
    private String changeByName;
    private String notes;
    private LocalDateTime timestamp = LocalDateTime.now();

    public StatusHistory() {}

    public StatusHistory(TicketStatus fromStatus, TicketStatus toStatus, String changedBy, String changeByName, String notes) {
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.changedBy = changedBy;
        this.changeByName = changeByName;
        this.notes = notes;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public TicketStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(TicketStatus fromStatus) { this.fromStatus = fromStatus; }

    public TicketStatus getToStatus() { return toStatus; }
    public void setToStatus(TicketStatus toStatus) { this.toStatus = toStatus; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

    public String getChangeByName() { return changeByName; }
    public void setChangeByName(String changeByName) { this.changeByName = changeByName; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
