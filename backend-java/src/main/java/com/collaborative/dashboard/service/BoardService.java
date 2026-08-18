package com.collaborative.dashboard.service;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.Board;
import com.collaborative.dashboard.model.BoardResponse;
import com.collaborative.dashboard.model.User;
import com.collaborative.dashboard.model.UserSummary;
import com.collaborative.dashboard.repository.BoardRepository;
import com.collaborative.dashboard.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

@Service
public class BoardService {
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    public BoardService(BoardRepository boardRepository, UserRepository userRepository) {
        this.boardRepository = boardRepository;
        this.userRepository = userRepository;
    }

    public ApiResponse<List<BoardResponse>> getAllBoards() {
        return response(boardRepository.findAll());
    }

    public ApiResponse<List<BoardResponse>> getBoardsByUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User ID is required");
        }
        ObjectId userObjectId;
        try {
            userObjectId = new ObjectId(userId);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid User ID format");
        }
        return response(boardRepository.findByOwnerOrMembers(userObjectId));
    }

    private ApiResponse<List<BoardResponse>> response(List<Board> boards) {
        Map<String, User> users = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        List<BoardResponse> data = boards.stream().map(board -> new BoardResponse(
                board.getId(),
                board.getTitle(),
                board.getDescription(),
                UserSummary.from(users.get(board.getOwner())),
                board.getMembers().stream().map(users::get).map(UserSummary::from).toList(),
                board.getColumns(),
                board.getCreatedAt(),
                board.getUpdatedAt())).toList();
        return new ApiResponse<>(true, data, data.size());
    }
}
