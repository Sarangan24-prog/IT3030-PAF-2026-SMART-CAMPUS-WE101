package com.smartcampus.backend.dto;

import com.smartcampus.backend.model.AvailabilityWindow;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;
import java.util.List;

public class ResourceResponse {
    private String id;
    private String code;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String building;
    private String floor;
    private ResourceStatus status;
    private String description;
    private Boolean bookable;
    private List<String> amenities;
    private List<AvailabilityWindow> availabilityWindows;
    private String imageUrl;

    public ResourceResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public ResourceType getType() { return type; }
    public void setType(ResourceType type) { this.type = type; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
    public ResourceStatus getStatus() { return status; }
    public void setStatus(ResourceStatus status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getBookable() { return bookable; }
    public void setBookable(Boolean bookable) { this.bookable = bookable; }
    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }
    public List<AvailabilityWindow> getAvailabilityWindows() { return availabilityWindows; }
    public void setAvailabilityWindows(List<AvailabilityWindow> availabilityWindows) { this.availabilityWindows = availabilityWindows; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
