package com.collaborative.dashboard.controller;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.TaskRequest;
import com.collaborative.dashboard.model.TaskResponse;
import com.collaborative.dashboard.service.TaskService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/board/{boardId}")
    public ApiResponse<List<TaskResponse>> getTasksByBoard(@PathVariable String boardId) {
        return taskService.getTasksByBoard(boardId);
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<TaskResponse>> getTasksByUser(@PathVariable String userId) {
        return taskService.getTasksByUser(userId);
    }

    @GetMapping("/{taskId}")
    public ApiResponse<List<TaskResponse>> getTaskById(@PathVariable String taskId) {
        return taskService.getTaskById(taskId);
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> addTask(@RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.addTask(request));
    }

    @PutMapping("/update")
    public ApiResponse<List<TaskResponse>> updateTask(@RequestBody TaskRequest request) {
        return taskService.updateTask(request);
    }

    @DeleteMapping("/delete/{taskId}")
    public ApiResponse<List<TaskResponse>> deleteTask(@PathVariable String taskId) {
        return taskService.deleteTask(taskId);
    }
}
