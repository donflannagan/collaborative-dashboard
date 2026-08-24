using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CollaborativeDashboard.Api.Controllers;

[ApiController]
[Route("api/users")]
public sealed class UsersController(UsersService service) : ControllerBase
{
    [HttpGet("by-userId/{userId}")]
    public Task<ApiResponse<UserSummary>> GetUserById(string userId, CancellationToken cancellationToken) => service.GetUserByIdAsync(userId, cancellationToken);

    [HttpGet("by-username/{username}")]
    public Task<ApiResponse<UserSummary>> GetUserByUsername(string username, CancellationToken cancellationToken) => service.GetUserByUsernameAsync(username, cancellationToken);

    [HttpGet("by-email/{email}")]
    public Task<ApiResponse<UserSummary>> GetUserByEmail(string email, CancellationToken cancellationToken) => service.GetUserByEmailAsync(email, cancellationToken);

    [HttpGet]
    public Task<ApiResponse<UserSummary>> GetAllUsers(CancellationToken cancellationToken) => service.GetAllUsersAsync(cancellationToken);


}