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
    public Task<ApiResponse<BoardResponse>> GetByUser(string userId, CancellationToken cancellationToken) => service.GetBoardsByUserAsync(userId, cancellationToken);

    [HttpGet("{boardId}")]
    public Task<ApiResponse<BoardResponse>> GetById(string boardId, CancellationToken cancellationToken) => service.GetBoardByIdAsync(boardId, cancellationToken);

    [HttpPost]
    public Task<ApiResponse<BoardResponse>> Create(BoardDocument board, CancellationToken cancellationToken) => service.CreateBoardAsync(board, cancellationToken);

    [HttpPut]
    public Task<ApiResponse<BoardResponse>> Update(BoardDocument board, CancellationToken cancellationToken) => service.UpdateBoardAsync(board, cancellationToken);

    [HttpDelete("{boardId}")]
    public Task<ApiResponse<BoardResponse>> Delete(string boardId, CancellationToken cancellationToken) => service.DeleteBoardAsync(boardId, cancellationToken);
}
