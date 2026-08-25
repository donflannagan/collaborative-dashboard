package com.collaborative.dashboard.controller;

import com.collaborative.dashboard.model.ApiResponse;
import com.collaborative.dashboard.model.UserSummary;
import com.collaborative.dashboard.service.UserService;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/by-userId/{userId}")
    public ApiResponse<List<UserSummary>> getUserById(@PathVariable String userId) {
        return userService.getUserById(userId);
    }

    @GetMapping("/by-username/{username}")
    public ApiResponse<List<UserSummary>> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }

    @GetMapping("/by-email/{email}")
    public ApiResponse<List<UserSummary>> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email);
    }

    @GetMapping
    public ApiResponse<List<UserSummary>> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public ApiResponse<List<UserSummary>> createUser(@RequestBody UserSummary userSummary) {
        return userService.createUser(userSummary);
    }

    @DeleteMapping("/delete/{userId}")
    public ApiResponse<List<UserSummary>> deleteUserById(@PathVariable String userId) {
        return userService.deleteUserById(userId);
    }

    @PutMapping("/update/{userId}")
    public ApiResponse<List<UserSummary>> updateUserById(
            @PathVariable String userId, @RequestBody UserSummary userSummary) {
        return userService.updateUserById(userId, userSummary);
    }
}