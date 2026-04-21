package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceStatus;
import com.smartcampus.backend.model.ResourceType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    Optional<Resource> findByCode(String code);
    boolean existsByCode(String code);

    List<Resource> findByType(ResourceType type);
    List<Resource> findByLocationContainingIgnoreCase(String location);
    List<Resource> findByBuildingContainingIgnoreCase(String building);
    List<Resource> findByStatus(ResourceStatus status);
}
