package com.campusflow.dto;

import com.campusflow.enums.ResourceStatus;
import com.campusflow.enums.ResourceType;

public class ResourceSearchRequest {
    private String keyword;
    private ResourceType type;
    private Integer minCapacity;
    private String location;
    private String building;
    private ResourceStatus status;
    private Boolean bookable;

    public ResourceSearchRequest() {}

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    public ResourceType getType() { return type; }
    public void setType(ResourceType type) { this.type = type; }
    public Integer getMinCapacity() { return minCapacity; }
    public void setMinCapacity(Integer minCapacity) { this.minCapacity = minCapacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }
    public ResourceStatus getStatus() { return status; }
    public void setStatus(ResourceStatus status) { this.status = status; }
    public Boolean getBookable() { return bookable; }
    public void setBookable(Boolean bookable) { this.bookable = bookable; }
}
