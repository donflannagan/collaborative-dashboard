using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.AspNetCore.Mvc;

namespace CollaborativeDashboard.Api.Services;

public class HealthService
{
    private readonly MongoDbContext _db;

    public HealthService(MongoDbContext db)  => _db = db;

    public async Task<HealthResponse> GetHealthStatus()
    {
        var health = new HealthResponse
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Uptime = DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime(),
            Services = new CoreServices
            {
                Express = "Healthy",
                Mongodb = await IsDatabaseHealthyAsync() ? "Healthy" : "Unhealthy"
            }
        };

        return health;
    }

    private async Task<bool> IsDatabaseHealthyAsync()
    {
        try
        {
            var database = _db.Users.Database;
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
            await database.RunCommandAsync((Command<BsonDocument>)"{ ping: 1 }", cancellationToken: cts.Token);
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }
}