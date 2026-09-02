package com.collaborative.dashboard.model;

import java.time.Instant;
import java.util.List;

public record TaskRequest(
        String taskId,
        String title,
        String description,
        String boardId,
        String columnId,
        int position,
        String assignee,
        String priority,
        Instant dueDate,
        List<String> tags,
        String createdBy) {
}