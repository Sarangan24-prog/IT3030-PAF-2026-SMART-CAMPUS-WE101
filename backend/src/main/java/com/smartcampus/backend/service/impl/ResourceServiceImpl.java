package com.smartcampus.backend.service.impl;

import com.smartcampus.backend.dto.ResourceRequest;
import com.smartcampus.backend.dto.ResourceResponse;
import com.smartcampus.backend.dto.ResourceSearchRequest;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.service.ResourceService;
import com.smartcampus.backend.util.ResourceMapper;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.springframework.stereotype.Service;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    @SuppressWarnings("null")
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
        return resourceRepository.findAllWithoutImageUrl()
                .stream()
                .map(resource -> ResourceMapper.toResponse(resource, false))
                .toList();
    }

    @Override
    public ResourceResponse getResourceById(String id) {
        Resource resource = resourceRepository.findById(Objects.requireNonNull(id, "id must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return ResourceMapper.toResponse(resource);
    }

    @Override
    public ResourceResponse updateResource(String id, ResourceRequest request) {
        Resource existing = resourceRepository.findById(Objects.requireNonNull(id, "id must not be null"))
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
        String resourceId = Objects.requireNonNull(id, "id must not be null");
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(resourceId);
    }

    @Override
    public List<ResourceResponse> searchResources(ResourceSearchRequest request) {
        return resourceRepository.findAllWithoutImageUrl()
                .stream()
                .filter(resource -> matchesKeyword(resource, request.getKeyword()))
                .filter(resource -> request.getType() == null || resource.getType() == request.getType())
                .filter(resource -> request.getMinCapacity() == null ||
                        (resource.getCapacity() != null && resource.getCapacity() >= request.getMinCapacity()))
                .filter(resource -> matchesText(resource.getLocation(), request.getLocation()))
                .filter(resource -> matchesText(resource.getBuilding(), request.getBuilding()))
                .filter(resource -> request.getStatus() == null || resource.getStatus() == request.getStatus())
                .filter(resource -> request.getBookable() == null || Objects.equals(resource.getBookable(), request.getBookable()))
                .map(resource -> ResourceMapper.toResponse(resource, false))
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
