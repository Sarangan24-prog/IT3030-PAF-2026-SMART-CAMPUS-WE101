package com.campusflow.service;

import com.campusflow.dto.ResourceRequest;
import com.campusflow.dto.ResourceResponse;
import com.campusflow.dto.ResourceSearchRequest;
import java.util.List;

public interface ResourceService {
    ResourceResponse createResource(ResourceRequest request);
    List<ResourceResponse> getAllResources();
    ResourceResponse getResourceById(String id);
    ResourceResponse updateResource(String id, ResourceRequest request);
    void deleteResource(String id);
    List<ResourceResponse> searchResources(ResourceSearchRequest request);
}
