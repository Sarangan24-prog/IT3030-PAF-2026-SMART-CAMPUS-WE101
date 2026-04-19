package com.campusflow.repository;

import com.campusflow.entity.Resource;
import com.campusflow.enums.ResourceStatus;
import com.campusflow.enums.ResourceType;
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
