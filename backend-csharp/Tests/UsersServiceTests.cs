using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using CollaborativeDashboard.Api.Exceptions;
using MongoDB.Driver;

namespace CollaborativeDashboard.Api.Tests;

[Collection("Mongo")]
public sealed class UsersServiceTests(MongoTestFixture fixture)
{
    private readonly UsersService service = new(fixture.Context);

    [Fact]
    public async Task CreateAndLookupUser()
    {
        await fixture.ResetAsync();
        var request = new UserSummary(string.Empty, "alice", "alice@example.com", "secret");

        var created = await service.CreateUserAsync(request, CancellationToken.None);
        var byEmail = await service.GetUserByEmailAsync(request.Email, CancellationToken.None);
        var byUsername = await service.GetUserByUsernameAsync(request.Username, CancellationToken.None);

        Assert.True(created.Success);
        Assert.NotEmpty(created.Data[0]._id);
        Assert.Equal(request.Email, byEmail.Data[0].Email);
        Assert.Equal(request.Username, byUsername.Data[0].Username);
    }

    [Fact]
    public async Task GetUserByIdReturnsEmptyResponseForUnknownUser()
    {
        await fixture.ResetAsync();

        var response = await service.GetUserByIdAsync(
            MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            CancellationToken.None);

        Assert.False(response.Success);
        Assert.Empty(response.Data);
        Assert.Equal(0, response.Count);
    }

    [Fact]
    public async Task GetUserByIdReturnsUserSummaryWhenFound()
    {
        await fixture.ResetAsync();
        var user = new UserDocument { Username = "found", Email = "found@example.com", Password = "secret" };
        await fixture.Context.Users.InsertOneAsync(user);

        var response = await service.GetUserByIdAsync(user.Id, CancellationToken.None);

        Assert.True(response.Success);
        Assert.Equal(user.Id, response.Data[0]._id);
        Assert.Equal("found", response.Data[0].Username);
    }

    [Fact]
    public async Task GetAllUsersReturnsEmptyResponseWhenDatabaseIsEmpty()
    {
        await fixture.ResetAsync();

        var response = await service.GetAllUsersAsync(CancellationToken.None);

        Assert.True(response.Success);
        Assert.Empty(response.Data);
        Assert.Equal(0, response.Count);
    }

    [Fact]
    public async Task LookupsReturnEmptyResponsesForUnknownUsernameAndEmail()
    {
        await fixture.ResetAsync();

        var byUsername = await service.GetUserByUsernameAsync("missing", CancellationToken.None);
        var byEmail = await service.GetUserByEmailAsync("missing@example.com", CancellationToken.None);

        Assert.False(byUsername.Success);
        Assert.False(byEmail.Success);
        Assert.Empty(byUsername.Data);
        Assert.Empty(byEmail.Data);
    }

    [Fact]
    public async Task UpdateUserPersistsIncomingValues()
    {
        await fixture.ResetAsync();
        var original = new UserDocument { Username = "old-name", Email = "old@example.com", Password = "old" };
        await fixture.Context.Users.InsertOneAsync(original);
        var update = new UserSummary(original.Id, "new-name", "new@example.com", "new-secret");

        var response = await service.UpdateUserByUserId(update, CancellationToken.None);
        var stored = await fixture.Context.Users.Find(user => user.Id == original.Id).SingleAsync();

        Assert.True(response.Success);
        Assert.Equal("new-name", stored.Username);
        Assert.Equal("new@example.com", stored.Email);
        Assert.Equal("new-secret", stored.Password);
        Assert.Equal("new-name", response.Data[0].Username);
    }

    [Fact]
    public async Task DeleteUserReturnsSuccessThenNotFound()
    {
        await fixture.ResetAsync();
        var user = new UserDocument { Username = "delete-me", Email = "delete@example.com", Password = "secret" };
        await fixture.Context.Users.InsertOneAsync(user);

        var deleted = await service.DeleteUserByIdAsync(user.Id, CancellationToken.None);
        var missing = await service.DeleteUserByIdAsync(user.Id, CancellationToken.None);

        Assert.True(deleted.Success);
        Assert.Equal(1, deleted.Count);
        Assert.False(missing.Success);
        Assert.Empty(missing.Data);
    }

    [Fact]
    public async Task CreateUserRejectsDuplicateUsernameAndEmail()
    {
        await fixture.ResetAsync();
        await fixture.Context.Users.InsertOneAsync(new UserDocument
        {
            Username = "existing",
            Email = "existing@example.com",
            Password = "secret",
        });

        await Assert.ThrowsAsync<ConflictException>(() => service.CreateUserAsync(
            new UserSummary(string.Empty, "existing", "new@example.com", "secret"),
            CancellationToken.None));
        await Assert.ThrowsAsync<ConflictException>(() => service.CreateUserAsync(
            new UserSummary(string.Empty, "new-user", "existing@example.com", "secret"),
            CancellationToken.None));
    }

    [Fact]
    public async Task UpdateUnknownUserReturnsEmptyResponse()
    {
        await fixture.ResetAsync();
        var update = new UserSummary(
            MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            "missing",
            "missing@example.com",
            "secret");

        var response = await service.UpdateUserByUserId(update, CancellationToken.None);

        Assert.False(response.Success);
        Assert.Empty(response.Data);
    }

    [Fact]
    public async Task UpdateWithUnchangedValuesReturnsUnsuccessfulResponse()
    {
        await fixture.ResetAsync();
        var user = new UserDocument { Username = "same", Email = "same@example.com", Password = "secret" };
        await fixture.Context.Users.InsertOneAsync(user);

        var response = await service.UpdateUserByUserId(
            new UserSummary(user.Id, user.Username, user.Email, user.Password),
            CancellationToken.None);

        Assert.False(response.Success);
        Assert.Empty(response.Data);
    }
}