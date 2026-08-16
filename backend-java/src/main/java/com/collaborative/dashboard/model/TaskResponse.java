package com.collaborative.dashboard.model;

import java.time.Instant;
import java.util.List;

public record TaskResponse(
        String _id,
        String title,
        String description,
        String boardId,
        String columnId,
        int position,
        UserSummary assignee,
        String priority,
        Instant dueDate,
        List<String> tags,
        UserSummary createdBy,
        Instant createdAt,
        Instant updatedAt) {
}
