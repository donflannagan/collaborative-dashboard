using CollaborativeDashboard.Api.Controllers;
using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Moq;

namespace CollaborativeDashboard.Api.Tests;

public sealed class BoardsControllerTests
{
    private readonly Mock<BoardService> boardService;
    private readonly BoardsController controller;

    public BoardsControllerTests()
    {
        var context = new MongoDbContext(new MongoClient("mongodb://localhost:27017"), Options.Create(new MongoDbSettings()));
        boardService = new Mock<BoardService>(MockBehavior.Strict, context);
        controller = new BoardsController(boardService.Object);
    }

    [Fact]
    public async Task GetAllReturnsBoardsAndCount()
    {
        var board = new BoardResponse("board-1", "Project Alpha", null, null, [], ["To Do", "Done"], default, default);
        boardService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<BoardResponse>(true, [board], 1));

        var response = await controller.GetAll(CancellationToken.None);

        Assert.True(response.Success);
        Assert.Single(response.Data);
        Assert.Equal(1, response.Count);
        boardService.Verify(service => service.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllReturnsEmptyResult()
    {
        boardService.Setup(service => service.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<BoardResponse>(true, [], 0));

        var response = await controller.GetAll(CancellationToken.None);

        Assert.True(response.Success);
        Assert.Empty(response.Data);
        Assert.Equal(0, response.Count);
    }

    [Fact]
    public async Task GetByUserPassesUserIdToService()
    {
        boardService.Setup(service => service.GetBoardsByUserAsync("user-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<BoardResponse>(true, [], 0));

        var response = await controller.GetByUser("user-1", CancellationToken.None);

        Assert.True(response.Success);
        boardService.Verify(service => service.GetBoardsByUserAsync("user-1", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetBoardByIdPassesBoardIdToService()
    {
        boardService.Setup(service => service.GetBoardByIdAsync("board-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<BoardResponse>(true, [], 0));

        var response = await controller.GetById("board-1", CancellationToken.None);

        Assert.True(response.Success);
        boardService.Verify(service => service.GetBoardByIdAsync("board-1", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteBoardPassesBoardIdToService()
    {
        boardService.Setup(service => service.DeleteBoardAsync("board-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<BoardResponse>(true, [], 0));

        var response = await controller.Delete("board-1", CancellationToken.None);

        Assert.True(response.Success);
        boardService.Verify(service => service.DeleteBoardAsync("board-1", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateBoardPassesBoardToService()
    {
        var board = new BoardDocument { Id = "board-1", Title = "Project Alpha" };
        boardService.Setup(service => service.CreateBoardAsync(board, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<BoardResponse>(true, [], 0));

        var response = await controller.Create(board, CancellationToken.None);

        Assert.True(response.Success);
        boardService.Verify(service => service.CreateBoardAsync(board, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateBoardPassesBoardToService()
    {
        var board = new BoardDocument { Id = "board-1", Title = "Project Alpha" };
        boardService.Setup(service => service.UpdateBoardAsync(board, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ApiResponse<BoardResponse>(true, [], 0));

        var response = await controller.Update(board, CancellationToken.None);

        Assert.True(response.Success);
        boardService.Verify(service => service.UpdateBoardAsync(board, It.IsAny<CancellationToken>()), Times.Once);
    }
}
