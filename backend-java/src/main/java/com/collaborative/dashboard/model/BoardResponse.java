package com.collaborative.dashboard.model;

import java.time.Instant;
import java.util.List;

public record BoardResponse(
        String _id,
        String title,
        String description,
        UserSummary owner,
        List<UserSummary> members,
        List<String> columns,
        Instant createdAt,
        Instant updatedAt) {
}
