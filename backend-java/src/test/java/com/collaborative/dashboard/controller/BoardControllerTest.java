package com.collaborative.dashboard.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.BoardResponse;
import com.collaborative.dashboard.model.UserSummary;
import com.collaborative.dashboard.service.BoardService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BoardController.class)
class BoardControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BoardService boardService;

    @Test
    void returnsAllBoards() throws Exception {
        BoardResponse board = new BoardResponse(
                "board-1", "Project Alpha", null,
                new UserSummary("user-1", "owner", "owner@example.com"),
                List.of(), List.of("To Do", "Done"), null, null);
        when(boardService.getAllBoards()).thenReturn(new ApiResponse<>(true, List.of(board), 1));

        mockMvc.perform(get("/api/boards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.count").value(1))
                .andExpect(jsonPath("$.data[0]._id").value("board-1"));
    }

    @Test
    void returnsBoardsForUser() throws Exception {
        when(boardService.getBoardsByUser("user-1"))
                .thenReturn(new ApiResponse<>(true, List.of(), 0));

        mockMvc.perform(get("/api/boards/user/user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty())
                .andExpect(jsonPath("$.count").value(0));
    }
}
