package com.collaborative.dashboard.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.collaborative.dashboard.MongoTestFixture;
import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.User;
import com.collaborative.dashboard.model.UserSummary;
import com.collaborative.dashboard.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.repository.support.MongoRepositoryFactory;

@ExtendWith(MongoTestFixture.class)
class UserServiceIntegrationTest {
    private UserRepository repository;
    private UserService service;

    @BeforeEach
    void setUp() {
        MongoTemplate template = new MongoTemplate(
                new SimpleMongoClientDatabaseFactory(
                        MongoTestFixture.connectionString() + "/collaborative-dashboard-tests"));
        repository = new MongoRepositoryFactory(template).getRepository(UserRepository.class);
        service = new UserService(repository);
    }

    @Test
    void createsAndLooksUpUser() {
        ApiResponse<java.util.List<UserSummary>> created = service.createUser(
                new UserSummary(null, "alice", "alice@example.com"));

        assertTrue(created.success());
        assertEquals("alice", service.getUserByUsername("alice").data().get(0).username());
        assertEquals("alice@example.com", service.getUserByEmail("alice@example.com").data().get(0).email());
    }

    @Test
    void updatesAndDeletesUser() {
        User user = new User();
        user.setUsername("old");
        user.setEmail("old@example.com");
        user = repository.save(user);

        ApiResponse<java.util.List<UserSummary>> updated = service.updateUserById(
                user.getId(), new UserSummary(user.getId(), "new", "new@example.com"));

        assertEquals("new", updated.data().get(0).username());
        assertTrue(service.deleteUserById(user.getId()).success());
        assertFalse(service.deleteUserById(user.getId()).success());
    }

    @Test
    void rejectsInvalidInputsAndUnknownUsers() {
        assertThrows(IllegalArgumentException.class, () -> service.getUserById(" "));
        assertThrows(IllegalArgumentException.class, () -> service.createUser(null));
        assertFalse(service.getUserById("missing").success());
        assertTrue(service.getAllUsers().success());
        assertTrue(service.getAllUsers().data().isEmpty());
    }
}