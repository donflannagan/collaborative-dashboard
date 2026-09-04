using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Testcontainers.MongoDb;

namespace CollaborativeDashboard.Api.Tests;

public sealed class MongoTestFixture : IAsyncLifetime
{
    private const string DatabaseName = "collaborative-dashboard-tests";
    private readonly MongoDbContainer container = new MongoDbBuilder()
        .WithImage("mongo:7.0")
        .Build();
    private IMongoDatabase database = null!;

    public MongoDbContext Context { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await container.StartAsync();
        var client = new MongoClient(container.GetConnectionString());
        database = client.GetDatabase(DatabaseName);
        Context = new MongoDbContext(
            client,
            Options.Create(new MongoDbSettings { DatabaseName = DatabaseName }));
    }

    public async Task ResetAsync()
    {
        await database.DropCollectionAsync("boards");
        await database.DropCollectionAsync("users");
        await database.DropCollectionAsync("tasks");
    }

    public Task DisposeAsync() => container.DisposeAsync().AsTask();
}

[CollectionDefinition("Mongo")]
public sealed class MongoCollection : ICollectionFixture<MongoTestFixture>;