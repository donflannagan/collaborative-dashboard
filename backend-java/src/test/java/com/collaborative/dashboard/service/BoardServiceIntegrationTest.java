package com.collaborative.dashboard.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.collaborative.dashboard.MongoTestFixture;
import com.collaborative.dashboard.model.Board;
import com.collaborative.dashboard.model.BoardResponse;
import com.collaborative.dashboard.model.User;
import com.collaborative.dashboard.repository.BoardRepository;
import com.collaborative.dashboard.repository.UserRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.repository.support.MongoRepositoryFactory;

@ExtendWith(MongoTestFixture.class)
class BoardServiceIntegrationTest {
    private BoardRepository boardRepository;
    private UserRepository userRepository;
    private BoardService service;

    @BeforeEach
    void setUp() {
        MongoTemplate template = new MongoTemplate(new SimpleMongoClientDatabaseFactory(
                MongoTestFixture.connectionString() + "/collaborative-dashboard-tests"));
        MongoRepositoryFactory factory = new MongoRepositoryFactory(template);
        boardRepository = factory.getRepository(BoardRepository.class);
        userRepository = factory.getRepository(UserRepository.class);
        service = new BoardService(boardRepository, userRepository);
    }

    @Test
    void returnsBoardsWithOwnerAndMemberSummaries() {
        User owner = saveUser("owner", "owner@example.com");
        User member = saveUser("member", "member@example.com");
        Board board = new Board();
        board.setTitle("Project Alpha");
        board.setOwner(owner.getId());
        board.setMembers(List.of(member.getId()));
        board.setColumns(List.of("To Do", "Done"));
        boardRepository.save(board);

        var response = service.getAllBoards();

        assertTrue(response.success());
        assertEquals(1, response.count());
        BoardResponse result = response.data().get(0);
        assertEquals("owner", result.owner().username());
        assertEquals("member", result.members().get(0).username());
        assertEquals(List.of("To Do", "Done"), result.columns());
    }

    @Test
    void findsBoardsOwnedByOrContainingUser() {
        User owner = saveUser("owner", "owner@example.com");
        User member = saveUser("member", "member@example.com");
        Board owned = board("Owned", owner.getId(), List.of());
        Board shared = board("Shared", owner.getId(), List.of(member.getId()));
        Board unrelated = board("Unrelated", owner.getId(), List.of());
        unrelated.setOwner(member.getId());
        boardRepository.saveAll(List.of(owned, shared, unrelated));

        var response = service.getBoardsByUser(member.getId());

        assertEquals(2, response.count());
        assertEquals(List.of("Shared", "Unrelated"), response.data().stream()
                .map(BoardResponse::title).sorted().toList());
    }

    @Test
    void returnsEmptyResponseForEmptyAndMissingBoardResults() {
        var all = service.getAllBoards();
        var missing = service.getBoardsByUser(org.bson.types.ObjectId.get().toHexString());

        assertTrue(all.success());
        assertTrue(all.data().isEmpty());
        assertTrue(missing.success());
        assertTrue(missing.data().isEmpty());
    }

    @Test
    void rejectsBlankAndMalformedUserIds() {
        assertThrows(IllegalArgumentException.class, () -> service.getBoardsByUser(null));
        assertThrows(IllegalArgumentException.class, () -> service.getBoardsByUser(" "));
        assertThrows(IllegalArgumentException.class, () -> service.getBoardsByUser("not-an-object-id"));
    }

    private User saveUser(String username, String email) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        return userRepository.save(user);
    }

    private Board board(String title, String owner, List<String> members) {
        Board board = new Board();
        board.setTitle(title);
        board.setOwner(owner);
        board.setMembers(members);
        return board;
    }
}