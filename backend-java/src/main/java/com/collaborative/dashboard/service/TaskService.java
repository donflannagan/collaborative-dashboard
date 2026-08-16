package com.collaborative.dashboard.service;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.Task;
import com.collaborative.dashboard.model.TaskResponse;
import com.collaborative.dashboard.model.User;
import com.collaborative.dashboard.model.UserSummary;
import com.collaborative.dashboard.repository.TaskRepository;
import com.collaborative.dashboard.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public ApiResponse<List<TaskResponse>> getTasksByBoard(String boardId) {
        if (boardId == null || boardId.isBlank()) {
            throw new IllegalArgumentException("Board ID is required");
        }
        List<Task> tasks = taskRepository.findByBoardIdOrderByColumnIdAscPositionAsc(boardId);
        Map<String, User> users = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        List<TaskResponse> data = tasks.stream().map(task -> new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getBoardId(),
                task.getColumnId(),
                task.getPosition(),
                UserSummary.from(users.get(task.getAssignee())),
                task.getPriority(),
                task.getDueDate(),
                task.getTags(),
                UserSummary.from(users.get(task.getCreatedBy())),
                task.getCreatedAt(),
                task.getUpdatedAt())).toList();
        return new ApiResponse<>(true, data, data.size());
    }
}
