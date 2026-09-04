using CollaborativeDashboard.Api.Services;
using CollaborativeDashboard.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CollaborativeDashboard.Api.Tests;

[Collection("Mongo")]
public sealed class HealthServiceTests(MongoTestFixture fixture)
{
    [Fact]
    public async Task HealthReportsMongoAsHealthyWhenContainerIsAvailable()
    {
        var response = await new HealthService(fixture.Context).GetHealthStatus();

        Assert.Equal("Healthy", response.Status);
        Assert.Equal("Healthy", response.Services.Mongodb);
        Assert.Equal("Healthy", response.Services.Express);
    }

    [Fact]
    public async Task HealthReportsMongoAsUnhealthyWhenDatabaseIsUnavailable()
    {
        var unavailableSettings = MongoClientSettings.FromConnectionString("mongodb://127.0.0.1:1");
        unavailableSettings.ServerSelectionTimeout = TimeSpan.FromMilliseconds(100);
        var unavailableClient = new MongoClient(unavailableSettings);
        var unavailableContext = new MongoDbContext(
            unavailableClient,
            Options.Create(new MongoDbSettings { DatabaseName = "unavailable" }));

        var response = await new HealthService(unavailableContext).GetHealthStatus();

        Assert.Equal("Unhealthy", response.Services.Mongodb);
    }
}