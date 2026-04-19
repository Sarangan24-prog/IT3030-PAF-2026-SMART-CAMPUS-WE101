package com.campusflow.service.impl;

import com.campusflow.dto.ResourceRequest;
import com.campusflow.dto.ResourceResponse;
import com.campusflow.dto.ResourceSearchRequest;
import com.campusflow.entity.Resource;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.ResourceRepository;
import com.campusflow.service.ResourceService;
import com.campusflow.util.ResourceMapper;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Autowired
    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public ResourceResponse createResource(ResourceRequest request) {
        if (resourceRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Resource code already exists");
        }

        validateAvailabilityWindows(request);
        Resource saved = resourceRepository.save(ResourceMapper.toEntity(request));
        return ResourceMapper.toResponse(saved);
    }

    @Override
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(ResourceMapper::toResponse)
                .toList();
    }

    @Override
    public ResourceResponse getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return ResourceMapper.toResponse(resource);
    }

    @Override
    public ResourceResponse updateResource(String id, ResourceRequest request) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        if (!existing.getCode().equals(request.getCode()) && resourceRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Resource code already exists");
        }

        validateAvailabilityWindows(request);

        existing.setCode(request.getCode());
        existing.setName(request.getName());
        existing.setType(request.getType());
        existing.setCapacity(request.getCapacity());
        existing.setLocation(request.getLocation());
        existing.setBuilding(request.getBuilding());
        existing.setFloor(request.getFloor());
        existing.setStatus(request.getStatus());
        existing.setDescription(request.getDescription());
        existing.setBookable(request.getBookable());
        existing.setAmenities(request.getAmenities());
        existing.setAvailabilityWindows(request.getAvailabilityWindows());
        existing.setImageUrl(request.getImageUrl());

        Resource updated = resourceRepository.save(existing);
        return ResourceMapper.toResponse(updated);
    }

    @Override
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    @Override
    public List<ResourceResponse> searchResources(ResourceSearchRequest request) {
        return resourceRepository.findAll()
                .stream()
                .filter(resource -> matchesKeyword(resource, request.getKeyword()))
                .filter(resource -> request.getType() == null || resource.getType() == request.getType())
                .filter(resource -> request.getMinCapacity() == null ||
                        (resource.getCapacity() != null && resource.getCapacity() >= request.getMinCapacity()))
                .filter(resource -> matchesText(resource.getLocation(), request.getLocation()))
                .filter(resource -> matchesText(resource.getBuilding(), request.getBuilding()))
                .filter(resource -> request.getStatus() == null || resource.getStatus() == request.getStatus())
                .filter(resource -> request.getBookable() == null || Objects.equals(resource.getBookable(), request.getBookable()))
                .map(ResourceMapper::toResponse)
                .toList();
    }

    private boolean matchesKeyword(Resource resource, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String lowerKeyword = keyword.toLowerCase(Locale.ROOT);
        return contains(resource.getName(), lowerKeyword)
                || contains(resource.getCode(), lowerKeyword)
                || contains(resource.getLocation(), lowerKeyword)
                || contains(resource.getBuilding(), lowerKeyword)
                || contains(resource.getDescription(), lowerKeyword)
                || (resource.getType() != null && resource.getType().name().toLowerCase(Locale.ROOT).contains(lowerKeyword));
    }

    private boolean matchesText(String source, String expected) {
        if (expected == null || expected.isBlank()) {
            return true;
        }
        return source != null && source.toLowerCase(Locale.ROOT).contains(expected.toLowerCase(Locale.ROOT));
    }

    private boolean contains(String source, String keyword) {
        return source != null && source.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private void validateAvailabilityWindows(ResourceRequest request) {
        if (request.getAvailabilityWindows() == null) {
            return;
        }

        request.getAvailabilityWindows().forEach(window -> {
            if (window.getStartTime().compareTo(window.getEndTime()) >= 0) {
                throw new IllegalArgumentException("Availability window startTime must be before endTime");
            }
        });
    }
}
