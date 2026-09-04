package com.collaborative.dashboard.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.collaborative.dashboard.MongoTestFixture;
import com.collaborative.dashboard.model.Task;
import com.collaborative.dashboard.model.TaskRequest;
import com.collaborative.dashboard.model.User;
import com.collaborative.dashboard.repository.TaskRepository;
import com.collaborative.dashboard.repository.UserRepository;
import java.util.List;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.repository.support.MongoRepositoryFactory;

@ExtendWith(MongoTestFixture.class)
class TaskServiceIntegrationTest {
    private TaskRepository taskRepository;
    private UserRepository userRepository;
    private TaskService service;

    @BeforeEach
    void setUp() {
        MongoTemplate template = new MongoTemplate(new SimpleMongoClientDatabaseFactory(
                MongoTestFixture.connectionString() + "/collaborative-dashboard-tests"));
        MongoRepositoryFactory factory = new MongoRepositoryFactory(template);
        taskRepository = factory.getRepository(TaskRepository.class);
        userRepository = factory.getRepository(UserRepository.class);
        service = new TaskService(taskRepository, userRepository);
    }

    @Test
    void addsTaskAndIncludesRelatedUserSummaries() {
        User creator = saveUser("creator", "creator@example.com");
        User assignee = saveUser("assignee", "assignee@example.com");
        String boardId = ObjectId.get().toHexString();
        TaskRequest request = request(null, "Ship feature", boardId, "To Do", assignee.getId(), creator.getId());

        var response = service.addTask(request);

        assertTrue(response.success());
        assertEquals("assignee", response.data().get(0).assignee().username());
        assertEquals("creator", response.data().get(0).createdBy().username());
        assertEquals(List.of("java"), response.data().get(0).tags());
    }

    @Test
    void addsTaskWithNullTagsAsAnEmptyList() {
        String boardId = ObjectId.get().toHexString();
        TaskRequest request = new TaskRequest(null, "No tags", null, boardId, "To Do", 0,
                null, "low", null, null, ObjectId.get().toHexString());

        var response = service.addTask(request);

        assertTrue(response.success());
        assertTrue(response.data().get(0).tags().isEmpty());
    }

    @Test
    void findsTasksByBoardAndUser() {
        User user = saveUser("worker", "worker@example.com");
        String boardId = ObjectId.get().toHexString();
        taskRepository.save(task("Assigned", boardId, "To Do", user.getId(), user.getId()));
        taskRepository.save(task("Created", ObjectId.get().toHexString(), "Done", null, user.getId()));
        taskRepository.save(task("Other", boardId, "Done", null, ObjectId.get().toHexString()));

        var byBoard = service.getTasksByBoard(boardId);
        var byUser = service.getTasksByUser(user.getId());

        assertEquals(2, byBoard.count());
        assertEquals(2, byUser.count());
        assertTrue(byUser.data().stream().anyMatch(task -> task.title().equals("Assigned")));
        assertTrue(byUser.data().stream().anyMatch(task -> task.title().equals("Created")));
    }

    @Test
    void updatesAndDeletesTask() {
        User creator = saveUser("creator", "creator@example.com");
        String boardId = ObjectId.get().toHexString();
        Task task = task("Before", boardId, "To Do", null, creator.getId());
        taskRepository.save(task);
        TaskRequest update = request(task.getId(), "After", boardId, "Done", null, creator.getId());

        var updated = service.updateTask(update);
        var deleted = service.deleteTask(task.getId());
        var missing = service.deleteTask(task.getId());

        assertEquals("After", updated.data().get(0).title());
        assertEquals("Done", updated.data().get(0).columnId());
        assertTrue(deleted.success());
        assertFalse(missing.success());
    }

    @Test
    void returnsEmptyResponsesForMissingTasksAndUsers() {
        String missingId = ObjectId.get().toHexString();

        var byTask = service.getTaskById(missingId);
        var byBoard = service.getTasksByBoard(ObjectId.get().toHexString());
        var byUser = service.getTasksByUser(ObjectId.get().toHexString());

        assertFalse(byTask.success());
        assertTrue(byBoard.data().isEmpty());
        assertTrue(byUser.data().isEmpty());
    }

    @Test
    void rejectsInvalidTaskRequestsAndIds() {
        assertThrows(IllegalArgumentException.class, () -> service.getTasksByBoard(null));
        assertThrows(IllegalArgumentException.class, () -> service.getTasksByBoard("bad-id"));
        assertThrows(IllegalArgumentException.class, () -> service.getTasksByUser(null));
        assertThrows(IllegalArgumentException.class, () -> service.getTasksByUser(" "));
        assertThrows(IllegalArgumentException.class, () -> service.getTaskById(null));
        assertThrows(IllegalArgumentException.class, () -> service.deleteTask(null));
        assertThrows(IllegalArgumentException.class, () -> service.addTask(null));
        assertThrows(IllegalArgumentException.class, () -> service.addTask(
                request(null, "", ObjectId.get().toHexString(), "To Do", null, ObjectId.get().toHexString())));
        assertThrows(IllegalArgumentException.class, () -> service.updateTask(null));
    }

    private User saveUser(String username, String email) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        return userRepository.save(user);
    }

    private Task task(String title, String boardId, String columnId, String assignee, String creator) {
        Task task = new Task();
        task.setTitle(title);
        task.setBoardId(boardId);
        task.setColumnId(columnId);
        task.setAssignee(assignee);
        task.setCreatedBy(creator);
        task.setTags(List.of("java"));
        return task;
    }

    private TaskRequest request(String taskId, String title, String boardId, String columnId,
            String assignee, String creator) {
        return new TaskRequest(taskId, title, null, boardId, columnId, 0, assignee,
                "high", null, List.of("java"), creator);
    }
}