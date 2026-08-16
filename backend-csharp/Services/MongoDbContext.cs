using CollaborativeDashboard.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CollaborativeDashboard.Api.Services;

public class MongoDbContext
{
    private readonly IMongoDatabase database;

    public MongoDbContext(IMongoClient client, IOptions<MongoDbSettings> settings)
    {
        database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<UserDocument> Users => database.GetCollection<UserDocument>("users");
    public IMongoCollection<BoardDocument> Boards => database.GetCollection<BoardDocument>("boards");
    public IMongoCollection<TaskDocument> Tasks => database.GetCollection<TaskDocument>("tasks");
}
