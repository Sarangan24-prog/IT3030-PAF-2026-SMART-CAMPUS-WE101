package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.ResourceRequest;
import com.smartcampus.backend.dto.ResourceResponse;
import com.smartcampus.backend.dto.ResourceSearchRequest;
import java.util.List;

public interface ResourceService {
    ResourceResponse createResource(ResourceRequest request);
    List<ResourceResponse> getAllResources();
    ResourceResponse getResourceById(String id);
    ResourceResponse updateResource(String id, ResourceRequest request);
    void deleteResource(String id);
    List<ResourceResponse> searchResources(ResourceSearchRequest request);
}
