package com.collaborative.dashboard.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.TaskResponse;
import com.collaborative.dashboard.service.TaskService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TaskController.class)
class TaskControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @Test
    void returnsTasksForBoard() throws Exception {
        TaskResponse task = new TaskResponse(
                "task-1", "Implement API", null, "board-1", "To Do", 0,
                null, "high", null, List.of("java"), null, null, null);
        when(taskService.getTasksByBoard("board-1"))
                .thenReturn(new ApiResponse<>(true, List.of(task), 1));

        mockMvc.perform(get("/api/tasks/board/board-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.count").value(1))
                .andExpect(jsonPath("$.data[0].title").value("Implement API"));
    }

    @Test
    void returnsBadRequestForInvalidBoardId() throws Exception {
        when(taskService.getTasksByBoard("board-1"))
                .thenThrow(new IllegalArgumentException("Board ID is required"));

        mockMvc.perform(get("/api/tasks/board/board-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Board ID is required"));
    }
}
