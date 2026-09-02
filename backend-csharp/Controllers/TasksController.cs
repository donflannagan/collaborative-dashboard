using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CollaborativeDashboard.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public sealed class TasksController(TaskService service) : ControllerBase
{
    [HttpGet("board/{boardId}")]
    public Task<ApiResponse<TaskResponse>> GetTasksByBoard(string boardId, CancellationToken cancellationToken) => service.GetByBoardAsync(boardId, cancellationToken);

    [HttpGet("user/{userId}")]
    public Task<ApiResponse<TaskResponse>> GetTasksByUser(string userId, CancellationToken cancellationToken) => service.GetByUserAsync(userId, cancellationToken);

    [HttpGet("{taskId}")]
    public Task<ApiResponse<TaskResponse>> GetTaskById(string taskId, CancellationToken cancellationToken) => service.GetTaskByIdAsync(taskId, cancellationToken);

    [HttpPost("add")]
    public Task<ApiResponse<TaskResponse>> AddTask(TaskDocument request, CancellationToken cancellationToken) => service.AddTask(request, cancellationToken);

    [HttpPut("update")]
    public Task<ApiResponse<TaskResponse>> UpdateTask(TaskDocument request, CancellationToken cancellationToken) => service.UpdateTask(request, cancellationToken);

    [HttpDelete("delete/{taskId}")]
    public Task<ApiResponse<TaskResponse>> DeleteTask(string taskId, CancellationToken cancellationToken) => service.DeleteTask(taskId, cancellationToken);
}
