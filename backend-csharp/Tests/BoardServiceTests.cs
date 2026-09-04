using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using MongoDB.Driver;

namespace CollaborativeDashboard.Api.Tests;

[Collection("Mongo")]
public sealed class BoardServiceTests(MongoTestFixture fixture)
{
    private readonly BoardService service = new(fixture.Context);

    [Fact]
    public async Task GetAllReturnsEmptyResponseWhenDatabaseIsEmpty()
    {
        await fixture.ResetAsync();

        var response = await service.GetAllAsync(CancellationToken.None);

        Assert.True(response.Success);
        Assert.Empty(response.Data);
        Assert.Equal(0, response.Count);
    }

    [Fact]
    public async Task CreateAndGetBoardIncludesUserSummaries()
    {
        await fixture.ResetAsync();
        var owner = new UserDocument { Email = "owner@example.com", Username = "owner", Password = "secret" };
        var member = new UserDocument { Email = "member@example.com", Username = "member", Password = "secret" };
        await fixture.Context.Users.InsertManyAsync([owner, member]);
        var board = new BoardDocument
        {
            Title = "Project Alpha",
            Description = "Integration test board",
            Owner = owner.Id,
            Members = [member.Id],
            Columns = ["To Do", "Done"],
        };

        var created = await service.CreateBoardAsync(board, CancellationToken.None);
        var loaded = await service.GetBoardByIdAsync(board.Id, CancellationToken.None);

        Assert.True(created.Success);
        Assert.Single(created.Data);
        Assert.True(loaded.Success);
        Assert.Equal("owner", loaded.Data[0].Owner!.Username);
        Assert.Equal("member", loaded.Data[0].Members[0].Username);
        Assert.Equal(["To Do", "Done"], loaded.Data[0].Columns);
    }

    [Fact]
    public async Task GetBoardsByUserReturnsOwnedAndMemberBoards()
    {
        await fixture.ResetAsync();
        var owner = new UserDocument { Email = "owner@example.com", Username = "owner", Password = "secret" };
        var member = new UserDocument { Email = "member@example.com", Username = "member", Password = "secret" };
        await fixture.Context.Users.InsertManyAsync([owner, member]);
        await fixture.Context.Boards.InsertManyAsync([
            new BoardDocument { Title = "Owned", Owner = owner.Id },
            new BoardDocument { Title = "Member", Owner = owner.Id, Members = [member.Id] },
            new BoardDocument { Title = "Other", Owner = member.Id },
        ]);

        var response = await service.GetBoardsByUserAsync(member.Id, CancellationToken.None);

        Assert.True(response.Success);
        Assert.Equal(2, response.Count);
        Assert.Equal(["Member", "Other"], response.Data.Select(board => board.Title).OrderBy(title => title));
    }

    [Fact]
    public async Task UpdateBoardPersistsReplacement()
    {
        await fixture.ResetAsync();
        var owner = new UserDocument { Email = "owner@example.com", Username = "owner", Password = "secret" };
        await fixture.Context.Users.InsertOneAsync(owner);
        var board = new BoardDocument { Title = "Before", Owner = owner.Id, Columns = ["Todo"] };
        await fixture.Context.Boards.InsertOneAsync(board);
        board.Title = "After";
        board.Columns = ["Todo", "Done"];

        await service.UpdateBoardAsync(board, CancellationToken.None);
        var stored = await fixture.Context.Boards.Find(item => item.Id == board.Id).SingleAsync();

        Assert.Equal("After", stored.Title);
        Assert.Equal(["Todo", "Done"], stored.Columns);
    }

    [Fact]
    public async Task DeleteBoardReturnsEmptyResponseWhenBoardDoesNotExist()
    {
        await fixture.ResetAsync();

        var response = await service.DeleteBoardAsync(
            MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            CancellationToken.None);

        Assert.True(response.Success);
        Assert.Empty(response.Data);
        Assert.Equal(0, response.Count);
    }

    [Fact]
    public async Task GetBoardByIdReturnsEmptyResponseWhenBoardDoesNotExist()
    {
        await fixture.ResetAsync();

        var response = await service.GetBoardByIdAsync(
            MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            CancellationToken.None);

        Assert.True(response.Success);
        Assert.Empty(response.Data);
        Assert.Equal(0, response.Count);
    }

    [Fact]
    public async Task UnknownOwnerAndMembersAreOmittedFromResponse()
    {
        await fixture.ResetAsync();
        var knownMember = new UserDocument { Username = "member", Email = "member@example.com", Password = "secret" };
        await fixture.Context.Users.InsertOneAsync(knownMember);
        await fixture.Context.Boards.InsertOneAsync(new BoardDocument
        {
            Title = "Partial board",
            Owner = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            Members = [knownMember.Id, MongoDB.Bson.ObjectId.GenerateNewId().ToString()],
        });

        var response = await service.GetAllAsync(CancellationToken.None);

        Assert.Null(response.Data[0].Owner);
        Assert.Single(response.Data[0].Members);
        Assert.Equal("member", response.Data[0].Members[0].Username);
    }

    [Fact]
    public async Task NullBoardRequestsAreRejected()
    {
        await Assert.ThrowsAsync<ArgumentNullException>(() =>
            service.CreateBoardAsync(null!, CancellationToken.None));
        await Assert.ThrowsAsync<ArgumentNullException>(() =>
            service.UpdateBoardAsync(null!, CancellationToken.None));
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public async Task BoardLookupsRejectBlankIds(string id)
    {
        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.GetBoardsByUserAsync(id, CancellationToken.None));
        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.GetBoardByIdAsync(id, CancellationToken.None));
        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.DeleteBoardAsync(id, CancellationToken.None));
    }
}