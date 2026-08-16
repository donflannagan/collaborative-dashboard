package com.collaborative.dashboard.controller;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.BoardResponse;
import com.collaborative.dashboard.service.BoardService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/boards")
public class BoardController {
    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    @GetMapping
    public ApiResponse<List<BoardResponse>> getAllBoards() {
        return boardService.getAllBoards();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<BoardResponse>> getBoardsByUser(@PathVariable String userId) {
        return boardService.getBoardsByUser(userId);
    }
}
