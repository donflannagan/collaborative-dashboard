package com.collaborative.dashboard.model;

public record ApiResponse<T>(boolean success, T data, int count) {
}
