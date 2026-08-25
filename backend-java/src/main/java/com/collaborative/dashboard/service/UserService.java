package com.collaborative.dashboard.service;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.User;
import com.collaborative.dashboard.model.UserSummary;
import com.collaborative.dashboard.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public ApiResponse<List<UserSummary>> getUserById(String userId) {
        requireValue(userId, "User ID is required");
        return singleUser(userRepository.findById(userId));
    }

    public ApiResponse<List<UserSummary>> getUserByUsername(String username) {
        requireValue(username, "Username is required");
        return singleUser(userRepository.findByUsername(username));
    }

    public ApiResponse<List<UserSummary>> getUserByEmail(String email) {
        requireValue(email, "Email is required");
        return singleUser(userRepository.findByEmail(email));
    }

    public ApiResponse<List<UserSummary>> getAllUsers() {
        return response(userRepository.findAll());
    }

    public ApiResponse<List<UserSummary>> createUser(UserSummary userSummary) {
        requireUserSummary(userSummary);

        User user = new User();
        user.setUsername(userSummary.username());
        user.setEmail(userSummary.email());
        return singleUser(userRepository.save(user));
    }

    public ApiResponse<List<UserSummary>> deleteUserById(String userId) {
        requireValue(userId, "User ID is required");

        return userRepository.findById(userId)
                .map(user -> {
                    userRepository.delete(user);
                    return response(List.of(user));
                })
                .orElse(emptyResponse());
    }

    public ApiResponse<List<UserSummary>> updateUserById(String userId, UserSummary userSummary) {
        requireValue(userId, "User ID is required");
        requireUserSummary(userSummary);

        return userRepository.findById(userId)
                .map(user -> {
                    user.setUsername(userSummary.username());
                    user.setEmail(userSummary.email());
                    return singleUser(userRepository.save(user));
                })
                .orElse(emptyResponse());
    }

    private ApiResponse<List<UserSummary>> singleUser(User user) {
        return user == null ? emptyResponse() : response(List.of(user));
    }

    private ApiResponse<List<UserSummary>> singleUser(java.util.Optional<User> user) {
        return user.map(this::singleUser).orElseGet(this::emptyResponse);
    }

    private ApiResponse<List<UserSummary>> response(List<User> users) {
        List<UserSummary> data = users.stream().map(UserSummary::from).toList();
        return new ApiResponse<>(true, data, data.size());
    }

    private ApiResponse<List<UserSummary>> emptyResponse() {
        return new ApiResponse<>(false, List.of(), 0);
    }

    private void requireValue(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }

    private void requireUserSummary(UserSummary userSummary) {
        if (userSummary == null) {
            throw new IllegalArgumentException("User is required");
        }
        requireValue(userSummary.username(), "Username is required");
        requireValue(userSummary.email(), "Email is required");
    }
}