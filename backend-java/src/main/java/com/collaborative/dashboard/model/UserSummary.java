package com.collaborative.dashboard.model;

public record UserSummary(String _id, String username, String email) {
    public static UserSummary from(User user) {
        return user == null ? null : new UserSummary(user.getId(), user.getUsername(), user.getEmail());
    }
}
