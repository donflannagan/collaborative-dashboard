package com.collaborative.dashboard.repository;

import com.collaborative.dashboard.model.Task;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByBoardIdOrderByColumnIdAscPositionAsc(String boardId);
}
