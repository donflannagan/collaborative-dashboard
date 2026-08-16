using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CollaborativeDashboard.Api.Controllers;

[ApiController]
[Route("api/boards")]
public sealed class BoardsController(BoardService service) : ControllerBase
{
    [HttpGet]
    public Task<ApiResponse<BoardResponse>> GetAll(CancellationToken cancellationToken) => service.GetAllAsync(cancellationToken);

    [HttpGet("user/{userId}")]
    public Task<ApiResponse<BoardResponse>> GetByUser(string userId, CancellationToken cancellationToken) => service.GetByUserAsync(userId, cancellationToken);
}
