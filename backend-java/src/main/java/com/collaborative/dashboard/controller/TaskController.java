package com.collaborative.dashboard.controller;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.TaskResponse;
import com.collaborative.dashboard.service.TaskService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
}
