package com.campusflow.util;

import com.campusflow.dto.ResourceRequest;
import com.campusflow.dto.ResourceResponse;
import com.campusflow.entity.Resource;

public class ResourceMapper {

    private ResourceMapper() {
    }

    public static Resource toEntity(ResourceRequest request) {
        Resource resource = new Resource();
        resource.setCode(request.getCode());
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setBuilding(request.getBuilding());
        resource.setFloor(request.getFloor());
        resource.setStatus(request.getStatus());
        resource.setDescription(request.getDescription());
        resource.setBookable(request.getBookable());
        resource.setAmenities(request.getAmenities());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setImageUrl(request.getImageUrl());
        return resource;
    }

    public static ResourceResponse toResponse(Resource resource) {
        ResourceResponse response = new ResourceResponse();
        response.setId(resource.getId());
        response.setCode(resource.getCode());
        response.setName(resource.getName());
        response.setType(resource.getType());
        response.setCapacity(resource.getCapacity());
        response.setLocation(resource.getLocation());
        response.setBuilding(resource.getBuilding());
        response.setFloor(resource.getFloor());
        response.setStatus(resource.getStatus());
        response.setDescription(resource.getDescription());
        response.setBookable(resource.getBookable());
        response.setAmenities(resource.getAmenities());
        response.setAvailabilityWindows(resource.getAvailabilityWindows());
        response.setImageUrl(resource.getImageUrl());
        return response;
    }
}
