using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using MongoDB.Driver;

namespace CollaborativeDashboard.Api.Tests;

[Collection("Mongo")]
public sealed class TaskServiceTests(MongoTestFixture fixture)
{
    private readonly TaskService service = new(fixture.Context);

    [Fact]
    public async Task AddAndGetTaskIncludesUserSummaries()
    {
        await fixture.ResetAsync();
        var creator = new UserDocument { Username = "creator", Email = "creator@example.com", Password = "secret" };
        var assignee = new UserDocument { Username = "assignee", Email = "assignee@example.com", Password = "secret" };
        await fixture.Context.Users.InsertManyAsync([creator, assignee]);
        var task = new TaskDocument
        {
            Title = "Ship feature",
            BoardId = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            ColumnId = "To Do",
            CreatedBy = creator.Id,
            Assignee = assignee.Id,
            Tags = ["release"],
        };

        var added = await service.AddTask(task, CancellationToken.None);
        var loaded = await service.GetTaskByIdAsync(task.Id, CancellationToken.None);

        Assert.True(added.Success);
        Assert.True(loaded.Success);
        Assert.Equal("assignee", loaded.Data[0].Assignee!.Username);
        Assert.Equal("creator", loaded.Data[0].CreatedBy!.Username);
        Assert.Equal(["release"], loaded.Data[0].Tags);
    }

    [Fact]
    public async Task GetByBoardAndUserReturnsMatchingTasks()
    {
        await fixture.ResetAsync();
        var user = new UserDocument { Username = "worker", Email = "worker@example.com", Password = "secret" };
        await fixture.Context.Users.InsertOneAsync(user);
        var boardId = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        await fixture.Context.Tasks.InsertManyAsync([
            new TaskDocument { Title = "Assigned", BoardId = boardId, ColumnId = "To Do", CreatedBy = user.Id, Assignee = user.Id },
            new TaskDocument { Title = "Created", BoardId = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), ColumnId = "Done", CreatedBy = user.Id },
            new TaskDocument { Title = "Other", BoardId = boardId, ColumnId = "Done", CreatedBy = MongoDB.Bson.ObjectId.GenerateNewId().ToString() },
        ]);

        var byBoard = await service.GetByBoardAsync(boardId, CancellationToken.None);
        var byUser = await service.GetByUserAsync(user.Id, CancellationToken.None);

        Assert.Equal(2, byBoard.Count);
        Assert.Equal(2, byUser.Count);
        Assert.Contains(byUser.Data, task => task.Title == "Assigned");
        Assert.Contains(byUser.Data, task => task.Title == "Created");
    }

    [Fact]
    public async Task EmptyTaskQueriesReturnEmptyResponses()
    {
        await fixture.ResetAsync();
        var boardId = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        var userId = MongoDB.Bson.ObjectId.GenerateNewId().ToString();

        var byBoard = await service.GetByBoardAsync(boardId, CancellationToken.None);
        var byUser = await service.GetByUserAsync(userId, CancellationToken.None);

        Assert.True(byBoard.Success);
        Assert.True(byUser.Success);
        Assert.Empty(byBoard.Data);
        Assert.Empty(byUser.Data);
    }

    [Fact]
    public async Task GetUnknownTaskThrowsNotFound()
    {
        await fixture.ResetAsync();

        await Assert.ThrowsAsync<ArgumentException>(() => service.GetTaskByIdAsync(
            MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            CancellationToken.None));
    }

    [Fact]
    public async Task TasksWithMissingRelatedUsersReturnNullSummaries()
    {
        await fixture.ResetAsync();
        var task = new TaskDocument
        {
            Title = "Unassigned",
            BoardId = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            ColumnId = "To Do",
            CreatedBy = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            Assignee = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
        };
        await fixture.Context.Tasks.InsertOneAsync(task);

        var response = await service.GetTaskByIdAsync(task.Id, CancellationToken.None);

        Assert.Null(response.Data[0].Assignee);
        Assert.Null(response.Data[0].CreatedBy);
    }

    [Fact]
    public async Task AddTaskWithoutAssigneeReturnsNullAssigneeSummary()
    {
        await fixture.ResetAsync();
        var task = new TaskDocument
        {
            Title = "Unassigned",
            BoardId = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            ColumnId = "To Do",
            CreatedBy = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
        };

        var response = await service.AddTask(task, CancellationToken.None);

        Assert.True(response.Success);
        Assert.Null(response.Data[0].Assignee);
        Assert.Null(response.Data[0].CreatedBy);
    }

    [Fact]
    public async Task UpdateTaskPersistsChanges()
    {
        await fixture.ResetAsync();
        var creator = new UserDocument { Username = "creator", Email = "creator@example.com", Password = "secret" };
        await fixture.Context.Users.InsertOneAsync(creator);
        var task = new TaskDocument
        {
            Title = "Before",
            BoardId = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            ColumnId = "To Do",
            CreatedBy = creator.Id,
        };
        await fixture.Context.Tasks.InsertOneAsync(task);
        task.Title = "After";
        task.ColumnId = "Done";

        var response = await service.UpdateTask(task, CancellationToken.None);
        var stored = await fixture.Context.Tasks.Find(item => item.Id == task.Id).SingleAsync();

        Assert.True(response.Success);
        Assert.Equal("After", stored.Title);
        Assert.Equal("Done", stored.ColumnId);
    }

    [Fact]
    public async Task DeleteTaskReturnsNotFoundForSecondDelete()
    {
        await fixture.ResetAsync();
        var task = new TaskDocument
        {
            Title = "Delete me",
            BoardId = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            ColumnId = "To Do",
            CreatedBy = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
        };
        await fixture.Context.Tasks.InsertOneAsync(task);

        var deleted = await service.DeleteTask(task.Id, CancellationToken.None);

        Assert.True(deleted.Success);
        await Assert.ThrowsAsync<ArgumentException>(() => service.DeleteTask(task.Id, CancellationToken.None));
    }

    [Fact]
    public async Task NullTaskRequestsAreRejected()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => service.AddTask(null!, CancellationToken.None));
        await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateTask(null!, CancellationToken.None));
    }

    [Fact]
    public async Task UpdateUnknownTaskThrowsNotFound()
    {
        await fixture.ResetAsync();
        var task = new TaskDocument
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            Title = "Missing",
            BoardId = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            ColumnId = "To Do",
            CreatedBy = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
        };

        await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateTask(task, CancellationToken.None));
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public async Task TaskValidationRejectsBlankIds(string id)
    {
        await Assert.ThrowsAsync<ArgumentException>(() => service.GetByBoardAsync(id, CancellationToken.None));
        await Assert.ThrowsAsync<ArgumentException>(() => service.GetByUserAsync(id, CancellationToken.None));
        await Assert.ThrowsAsync<ArgumentException>(() => service.GetTaskByIdAsync(id, CancellationToken.None));
        await Assert.ThrowsAsync<ArgumentException>(() => service.DeleteTask(id, CancellationToken.None));
    }
}