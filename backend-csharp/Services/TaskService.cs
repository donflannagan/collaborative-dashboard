using CollaborativeDashboard.Api.Models;
using MongoDB.Driver;

namespace CollaborativeDashboard.Api.Services;

public class TaskService
{
    private readonly MongoDbContext db;

    public TaskService(MongoDbContext db) => this.db = db;

    public virtual async Task<ApiResponse<TaskResponse>> GetByBoardAsync(string boardId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(boardId)) throw new ArgumentException("Board ID is required");
        var filter = Builders<TaskDocument>.Filter.Eq(task => task.BoardId, boardId);
        var tasks = await db.Tasks.Find(filter)
            .SortBy(task => task.ColumnId)
            .ThenBy(task => task.Position)
            .ToListAsync(cancellationToken);
        var ids = tasks.SelectMany(task => new[] { task.Assignee, task.CreatedBy }).Where(id => id != null).Distinct().ToList()!;
        var users = await db.Users.Find(Builders<UserDocument>.Filter.In(user => user.Id, ids)).ToListAsync(cancellationToken);
        var byId = users.ToDictionary(user => user.Id);
        var data = tasks.Select(task => new TaskResponse(
            task.Id, task.Title, task.Description, task.BoardId, task.ColumnId, task.Position,
            task.Assignee != null && byId.TryGetValue(task.Assignee, out var assignee) ? Summary(assignee) : null,
            task.Priority, task.DueDate, task.Tags,
            byId.TryGetValue(task.CreatedBy, out var creator) ? Summary(creator) : null,
            task.CreatedAt, task.UpdatedAt)).ToList();
        return new ApiResponse<TaskResponse>(true, data, data.Count);
    }

    private static UserSummary Summary(UserDocument user) => new(user.Id, user.Username, user.Email);
}
