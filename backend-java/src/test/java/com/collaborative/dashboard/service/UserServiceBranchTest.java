package com.collaborative.dashboard.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.collaborative.dashboard.model.User;
import com.collaborative.dashboard.model.UserSummary;
import com.collaborative.dashboard.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class UserServiceBranchTest {
    @Test
    void createUserReturnsEmptyResponseWhenRepositoryReturnsNull() {
        UserRepository repository = mock(UserRepository.class);
        when(repository.save(org.mockito.ArgumentMatchers.any(User.class))).thenReturn(null);

        var response = new UserService(repository).createUser(
                new UserSummary(null, "alice", "alice@example.com"));

        assertTrue(response.data().isEmpty());
        assertEquals(0, response.count());
    }

    @Test
    void validationRejectsNullAndBlankValues() {
        UserService service = new UserService(mock(UserRepository.class));

        assertThrows(IllegalArgumentException.class, () -> service.getUserById(null));
        assertThrows(IllegalArgumentException.class, () -> service.getUserByUsername(null));
        assertThrows(IllegalArgumentException.class, () -> service.getUserByEmail(null));
        assertThrows(IllegalArgumentException.class, () -> service.deleteUserById(null));
        assertThrows(IllegalArgumentException.class, () -> service.updateUserById(null,
                new UserSummary(null, "alice", "alice@example.com")));
        assertThrows(IllegalArgumentException.class, () -> service.createUser(
                new UserSummary(null, null, "alice@example.com")));
        assertThrows(IllegalArgumentException.class, () -> service.createUser(
                new UserSummary(null, "alice", null)));
    }

    @Test
    void updateReturnsEmptyResponseWhenUserIsUnknown() {
        UserRepository repository = mock(UserRepository.class);
        when(repository.findById("missing")).thenReturn(Optional.empty());

        var response = new UserService(repository).updateUserById(
                "missing", new UserSummary("missing", "alice", "alice@example.com"));

        assertTrue(response.data().isEmpty());
    }
}