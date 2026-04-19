package com.campusflow.controller;

import com.campusflow.dto.ResourceRequest;
import com.campusflow.dto.ResourceResponse;
import com.campusflow.dto.ResourceSearchRequest;
import com.campusflow.service.ResourceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:3000") // changed to 3000 to match the project React port instead of 5173
public class ResourceController {

    private final ResourceService resourceService;

    @Autowired
    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequest request
    ) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/search")
    public ResponseEntity<List<ResourceResponse>> searchResources(@RequestBody ResourceSearchRequest request) {
        return ResponseEntity.ok(resourceService.searchResources(request));
    }
}
