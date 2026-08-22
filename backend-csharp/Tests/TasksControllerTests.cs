using CollaborativeDashboard.Api.Controllers;
using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Moq;

namespace CollaborativeDashboard.Api.Tests;

public sealed class TasksControllerTests
{
    private readonly Mock<TaskService> taskService;
    private readonly TasksController controller;

    public TasksControllerTests()
    {
        var context = new MongoDbContext(new MongoClient("mongodb://localhost:27017"), Options.Create(new MongoDbSettings()));
        taskService = new Mock<TaskService>(MockBehavior.Strict, context);
        controller = new TasksController(taskService.Object);
    }

    [Fact]
    public async Task GetByBoardReturnsTasksAndCount()
    {
        var task = new TaskResponse("task-1", "Implement API", null, "board-1", "To Do", 0, null, "high", null, ["csharp"], null, default, default);
        taskService.Setup(service => service.GetByBoardAsync("board-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<TaskResponse>(true, [task], 1));

        var response = await controller.GetByBoard("board-1", CancellationToken.None);

        Assert.True(response.Success);
        Assert.Single(response.Data);
        Assert.Equal("Implement API", response.Data[0].Title);
        Assert.Equal(1, response.Count);
    }

    [Fact]
    public async Task GetByBoardReturnsEmptyResult()
    {
        taskService.Setup(service => service.GetByBoardAsync("board-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<TaskResponse>(true, [], 0));

        var response = await controller.GetByBoard("board-1", CancellationToken.None);

        Assert.True(response.Success);
        Assert.Empty(response.Data);
        Assert.Equal(0, response.Count);
    }

    [Fact]
    public async Task GetByBoardPassesBoardIdToService()
    {
        taskService.Setup(service => service.GetByBoardAsync("board-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<TaskResponse>(true, [], 0));

        await controller.GetByBoard("board-1", CancellationToken.None);

        taskService.Verify(service => service.GetByBoardAsync("board-1", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetByIdReturnsTaskAndCount()
    {
        var task = new TaskResponse("task-1", 
            "Implement API", 
            null, 
            "board-1", 
            "To Do", 
            0, 
            null, 
            "high", 
            null, 
            ["csharp"], 
            null, 
            default, 
            default);
        taskService.Setup(service => service.GetByIdAsync("task-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<TaskResponse>(true, [task], 1));

        var response = await controller.GetById("task-1", CancellationToken.None);

        Assert.True(response.Success);
        Assert.Single(response.Data);
        Assert.Equal("Implement API", response.Data[0].Title);
        Assert.Equal(1, response.Count);
    }

    [Fact]
    public async Task GetByIdPassesTaskIdToService()
    {
        taskService.Setup(service => service.GetByIdAsync("task-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<TaskResponse>(true, [], 0));

        await controller.GetById("task-1", CancellationToken.None);

        taskService.Verify(service => service.GetByIdAsync("task-1", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task AddTaskPassesRequestToService()
    {
        var request = new TaskDocument
        {
            Id = "task-1",
            Title = "Implement API",
            BoardId = "board-1",
            ColumnId = "To Do",
            Position = 0,
            Priority = "high",
            Tags = new List<string> { "csharp" }
        };

        taskService.Setup(service => service.AddTask(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<TaskResponse>(true, [], 0));

        await controller.AddTask(request, CancellationToken.None);

        taskService.Verify(service => service.AddTask(request, It.IsAny<CancellationToken>()), Times.Once);
    }
}
