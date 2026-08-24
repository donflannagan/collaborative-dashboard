using CollaborativeDashboard.Api.Controllers;
using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Moq;

namespace CollaborativeDashboard.Api.Tests;

public sealed class UsersControllerTests
{
    private readonly Mock<UsersService> userService;
    private readonly UsersController controller;

    public UsersControllerTests()
    {
        var context = new MongoDbContext(new MongoClient("mongodb://localhost:27017"), Options.Create(new MongoDbSettings()));
        userService = new Mock<UsersService>(MockBehavior.Strict, context);
        controller = new UsersController(userService.Object);
    }

    [Fact]
    public async Task GetUserByIdReturnsUserSummary()
    {
        var userId = "user-1";
        var username = "testuser";
        var email = "testuser@example.com";
        var userSummary = new UserSummary(userId, username, email);
        userService.Setup(service => service.GetUserByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<UserSummary>(true, new[] { userSummary }.ToList(), 1));

        var response = await controller.GetUserById(userId, CancellationToken.None);

        Assert.True(response.Success);
        Assert.Single(response.Data);
        Assert.Equal(userId, response.Data[0]._id);
        Assert.Equal(username, response.Data[0].Username);
        Assert.Equal(email, response.Data[0].Email);
        Assert.Equal(1, response.Count);
    }

    [Fact]
    public async Task GetUserByUsernameReturnsUserSummary()
    {
        var userId = "user-1";
        var username = "testuser";
        var email = "testuser@example.com";
        var userSummary = new UserSummary(userId, username, email);
        userService.Setup(service => service.GetUserByUsernameAsync(username, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<UserSummary>(true, new[] { userSummary }.ToList(), 1));

        var response = await controller.GetUserByUsername(username, CancellationToken.None);

        Assert.True(response.Success);
        Assert.Single(response.Data);
        Assert.Equal(userId, response.Data[0]._id);
        Assert.Equal(username, response.Data[0].Username);
        Assert.Equal(email, response.Data[0].Email);
        Assert.Equal(1, response.Count);
    }

    [Fact]
    public async Task GetUserByEmailReturnsUserSummary()
    {
        var userId = "user-1";
        var username = "testuser";
        var email = "testuser@example.com";
        var userSummary = new UserSummary(userId, username, email);
        userService.Setup(service => service.GetUserByEmailAsync(email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<UserSummary>(true, new[] { userSummary }.ToList(), 1));

        var response = await controller.GetUserByEmail(email, CancellationToken.None);

        Assert.True(response.Success);
        Assert.Single(response.Data);
        Assert.Equal(userId, response.Data[0]._id);
        Assert.Equal(username, response.Data[0].Username);
        Assert.Equal(email, response.Data[0].Email);
        Assert.Equal(1, response.Count);
    }

    [Fact]
    public async Task GetAllUsersReturnsUserSummaries()
    {
        var userId = "user-1";
        var username = "testuser";
        var email = "testuser@example.com";
        var userSummary = new UserSummary(userId, username, email);
        userService.Setup(service => service.GetAllUsersAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<UserSummary>(true, new[] { userSummary }.ToList(), 1));

        var response = await controller.GetAllUsers(CancellationToken.None);

        Assert.True(response.Success);
        Assert.Single(response.Data);
        Assert.Equal(userId, response.Data[0]._id);
        Assert.Equal(username, response.Data[0].Username);
        Assert.Equal(email, response.Data[0].Email);
        Assert.Equal(1, response.Count);
    }

    [Fact]
    public async Task UpdateUserByUserIdReturnsUserSummary()
    {
        var userId = "user-1";
        var username = "testuser";
        var email = "testuser@example.com";
        var userSummary = new UserSummary(userId, username, email);
        userService.Setup(service => service.UpdateUserByUserId(userSummary, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<UserSummary>(true, new[] { userSummary }.ToList(), 1));

        var response = await controller.UpdateUserByUserId(userSummary, CancellationToken.None);

        Assert.True(response.Success);
        Assert.Single(response.Data);
        Assert.Equal(userId, response.Data[0]._id);
        Assert.Equal(username, response.Data[0].Username);
        Assert.Equal(email, response.Data[0].Email);
        Assert.Equal(1, response.Count);
    }

    [Fact]
    public async Task DeleteUserByIdReturnsUserSummary()
    {
        var userId = "user-1";
        var username = "testuser";
        var email = "testuser@example.com";
        var userSummary = new UserSummary(userId, username, email);
        userService.Setup(service => service.DeleteUserByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<UserSummary>(true, new[] { userSummary }.ToList(), 1));

        var response = await controller.DeleteUserById(userId, CancellationToken.None);

        Assert.True(response.Success);
        Assert.Single(response.Data);
        Assert.Equal(userId, response.Data[0]._id);
        Assert.Equal(username, response.Data[0].Username);
        Assert.Equal(email, response.Data[0].Email);
        Assert.Equal(1, response.Count);
    }

    [Fact]
    public async Task CreateUserReturnsUserSummary()
    {
        var userId = "user-1";
        var username = "testuser";
        var email = "testuser@example.com";
        var userSummary = new UserSummary(userId, username, email);
        userService.Setup(service => service.CreateUserAsync(userSummary, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<UserSummary>(true, new[] { userSummary }.ToList(), 1));

        var response = await controller.CreateUser(userSummary, CancellationToken.None);

        Assert.True(response.Success);
        Assert.Single(response.Data);
        Assert.Equal(userId, response.Data[0]._id);
        Assert.Equal(username, response.Data[0].Username);
        Assert.Equal(email, response.Data[0].Email);
        Assert.Equal(1, response.Count);
    }
}