using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CollaborativeDashboard.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public sealed class TasksController(TaskService service) : ControllerBase
{
    [HttpGet("board/{boardId}")]
    public Task<ApiResponse<TaskResponse>> GetByBoard(string boardId, CancellationToken cancellationToken) => service.GetByBoardAsync(boardId, cancellationToken);
}
