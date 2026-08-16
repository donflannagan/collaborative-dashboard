namespace CollaborativeDashboard.Api.Models;

public sealed record UserSummary(string _id, string Username, string Email);
public sealed record BoardResponse(string _id, string Title, string? Description, UserSummary? Owner, IReadOnlyList<UserSummary> Members, IReadOnlyList<string> Columns, DateTime CreatedAt, DateTime UpdatedAt);
public sealed record TaskResponse(string _id, string Title, string? Description, string BoardId, string ColumnId, int Position, UserSummary? Assignee, string? Priority, DateTime? DueDate, IReadOnlyList<string> Tags, UserSummary? CreatedBy, DateTime CreatedAt, DateTime UpdatedAt);
public sealed record ApiResponse<T>(bool Success, IReadOnlyList<T> Data, int Count);
