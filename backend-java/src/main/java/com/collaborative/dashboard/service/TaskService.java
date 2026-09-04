package com.collaborative.dashboard.service;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.Task;
import com.collaborative.dashboard.model.TaskRequest;
import com.collaborative.dashboard.model.TaskResponse;
import com.collaborative.dashboard.model.User;
import com.collaborative.dashboard.model.UserSummary;
import com.collaborative.dashboard.repository.TaskRepository;
import com.collaborative.dashboard.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
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
        ObjectId boardObjectId = toObjectId(boardId, "Board ID");
        Sort sort = Sort.by(Sort.Order.asc("columnId"), Sort.Order.asc("position"));
        List<Task> tasks = taskRepository.findByBoardId(boardObjectId, sort);
        return response(tasks);
    }

    public ApiResponse<List<TaskResponse>> getTasksByUser(String userId) {
        ObjectId userObjectId = toObjectId(userId, "User ID");
        List<Task> tasks = taskRepository.findByUserId(
                userObjectId, Sort.by(Sort.Order.desc("updatedAt")));
        return response(tasks);
    }

    public ApiResponse<List<TaskResponse>> getTaskById(String taskId) {
        requireValue(taskId, "Task ID is required");
        return taskRepository.findById(taskId)
                .map(task -> response(List.of(task)))
                .orElseGet(this::emptyResponse);
    }

    public ApiResponse<List<TaskResponse>> addTask(TaskRequest request) {
        requireCreateRequest(request);
        Task task = new Task();
        applyRequest(task, request, true);
        Instant now = Instant.now();
        task.setCreatedAt(now);
        task.setUpdatedAt(now);
        return response(List.of(taskRepository.save(task)));
    }

    public ApiResponse<List<TaskResponse>> updateTask(TaskRequest request) {
        requireValue(request == null ? null : request.taskId(), "Task ID is required");
        requireUpdateRequest(request);
        return taskRepository.findById(request.taskId())
                .map(task -> {
                    applyRequest(task, request, false);
                    task.setUpdatedAt(Instant.now());
                    return response(List.of(taskRepository.save(task)));
                })
                .orElseGet(this::emptyResponse);
    }

    public ApiResponse<List<TaskResponse>> deleteTask(String taskId) {
        requireValue(taskId, "Task ID is required");
        return taskRepository.findById(taskId)
                .map(task -> {
                    taskRepository.delete(task);
                    return response(List.of(task));
                })
                .orElseGet(this::emptyResponse);
    }

    private ApiResponse<List<TaskResponse>> response(List<Task> tasks) {
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

    private ApiResponse<List<TaskResponse>> emptyResponse() {
        return new ApiResponse<>(false, List.of(), 0);
    }

    private ObjectId toObjectId(String id, String name) {
        requireValue(id, name + " is required");
        try {
            return new ObjectId(id);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid " + name + " format");
        }
    }

    private void requireCreateRequest(TaskRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Task is required");
        }
        requireValue(request.title(), "Title is required");
        toObjectId(request.boardId(), "Board ID");
        requireValue(request.columnId(), "Column ID is required");
        toObjectId(request.createdBy(), "Created by user ID");
    }

    private void requireUpdateRequest(TaskRequest request) {
        requireValue(request.title(), "Title is required");
        toObjectId(request.boardId(), "Board ID");
        requireValue(request.columnId(), "Column ID is required");
    }

    private void applyRequest(Task task, TaskRequest request, boolean includeCreatedBy) {
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setBoardId(request.boardId());
        task.setColumnId(request.columnId());
        task.setPosition(request.position());
        task.setAssignee(request.assignee());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setTags(request.tags() == null ? List.of() : request.tags());
        if (includeCreatedBy) {
            task.setCreatedBy(request.createdBy());
        }
    }

    private void requireValue(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}
