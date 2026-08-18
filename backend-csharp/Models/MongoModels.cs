using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CollaborativeDashboard.Api.Models;

public sealed class MongoDbSettings
{
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";
    public string DatabaseName { get; set; } = "collaborative-dashboard";
}

[BsonIgnoreExtraElements]
public sealed class UserDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
}

[BsonIgnoreExtraElements]
public sealed class BoardDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    [BsonRepresentation(BsonType.ObjectId)]
    public string Owner { get; set; } = string.Empty;
    [BsonRepresentation(BsonType.ObjectId)]
    public List<string> Members { get; set; } = [];
    public List<string> Columns { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

[BsonIgnoreExtraElements]
public sealed class TaskDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    [BsonRepresentation(BsonType.ObjectId)]
    public string BoardId { get; set; } = string.Empty;
    public string ColumnId { get; set; } = string.Empty;
    public int Position { get; set; }
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Assignee { get; set; }
    public string? Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public List<string> Tags { get; set; } = [];
    [BsonRepresentation(BsonType.ObjectId)]
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
