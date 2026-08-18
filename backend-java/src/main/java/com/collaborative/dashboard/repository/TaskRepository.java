package com.collaborative.dashboard.repository;

import com.collaborative.dashboard.model.Task;
import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface TaskRepository extends MongoRepository<Task, String> {
    // boardId is stored as BSON ObjectId; the domain field is String, so the
    // filter must be built with ObjectId explicitly rather than a derived query.
    @Query("{ 'boardId': ?0 }")
    List<Task> findByBoardId(ObjectId boardId, Sort sort);
}
