using CollaborativeDashboard.Api.Models;
using MongoDB.Driver;

namespace CollaborativeDashboard.Api.Services;

public class TaskService
{
    private readonly MongoDbContext db;

    public TaskService(MongoDbContext db) => this.db = db;

    public virtual async Task<ApiResponse<TaskResponse>> GetByBoardAsync(string boardId, CancellationToken cancellationToken)
    {
        ValidateBoardId(boardId);

        var filter = Builders<TaskDocument>.Filter.Eq(task => task.BoardId, boardId);
        ValidateFilter(filter);
        var tasks = await db.Tasks.Find(filter)
            .SortBy(task => task.ColumnId)
            .ThenBy(task => task.Position)
            .ToListAsync(cancellationToken);        
        
        ValidateTasks(tasks);

        var ids = tasks.SelectMany(task => new[] { task.Assignee, task.CreatedBy }).Where(id => id != null).Distinct().ToList()!;
        var users = await db.Users.Find(Builders<UserDocument>.Filter.In(user => user.Id, ids)).ToListAsync(cancellationToken);
        
        ValidateUsers(users);

        var byId = users.ToDictionary(user => user.Id);
        
        var data = tasks.Select(task => new TaskResponse(
            task.Id, task.Title, task.Description, task.BoardId, task.ColumnId, task.Position,
            task.Assignee != null && byId.TryGetValue(task.Assignee, out var assignee) ? Summary(assignee) : null,
            task.Priority, task.DueDate, task.Tags,
            byId.TryGetValue(task.CreatedBy, out var creator) ? Summary(creator) : null,
            task.CreatedAt, task.UpdatedAt)).ToList();
        return new ApiResponse<TaskResponse>(true, data, data.Count);
    }

    public virtual async Task<ApiResponse<TaskResponse>> GetByIdAsync(string taskId, CancellationToken cancellationToken)
    {
        ValidateTaskId(taskId);

        var filter = Builders<TaskDocument>.Filter.Eq(task => task.Id, taskId);
        ValidateFilter(filter);
        var task = await db.Tasks.Find(filter).FirstOrDefaultAsync(cancellationToken);
        if (task == null) throw new ArgumentException("Task not found for the given ID");

        var ids = new[] { task.Assignee, task.CreatedBy }.Where(id => id != null).Distinct().ToList()!;
        var users = await db.Users.Find(Builders<UserDocument>.Filter.In(user => user.Id, ids)).ToListAsync(cancellationToken);
        ValidateUsers(users);

        var byId = users.ToDictionary(user => user.Id);

        var data = new TaskResponse(
            task.Id, task.Title, task.Description, task.BoardId, task.ColumnId, task.Position,
            task.Assignee != null && byId.TryGetValue(task.Assignee, out var assignee) ? Summary(assignee) : null,
            task.Priority, task.DueDate, task.Tags,
            byId.TryGetValue(task.CreatedBy, out var creator) ? Summary(creator) : null,
            task.CreatedAt, task.UpdatedAt);
        return new ApiResponse<TaskResponse>(true, new[] { data }.ToList(), 1);
    }

    public virtual async Task<ApiResponse<TaskResponse>> AddTask(TaskDocument request, CancellationToken cancellationToken)
    {
        if (request == null) throw new ArgumentException("Task document cannot be null");
        ValidateBoardId(request.BoardId);

        await db.Tasks.InsertOneAsync(request, cancellationToken: cancellationToken);

        var ids = new[] { request.Assignee, request.CreatedBy }.Where(id => id != null).Distinct().ToList()!;
        var users = await db.Users.Find(Builders<UserDocument>.Filter.In(user => user.Id, ids)).ToListAsync(cancellationToken);

        ValidateUsers(users);
        
        var byId = users.ToDictionary(user => user.Id);
        var data = new TaskResponse(
            request.Id, 
            request.Title, 
            request.Description, 
            request.BoardId, 
            request.ColumnId, 
            request.Position,
            request.Assignee != null && byId.TryGetValue(request.Assignee, out var assignee) ? Summary(assignee) : null,
            request.Priority, 
            request.DueDate, 
            request.Tags,
            byId.TryGetValue(request.CreatedBy, out var creator) ? Summary(creator) : null,
            request.CreatedAt, request.UpdatedAt);
        return new ApiResponse<TaskResponse>(true, new[] { data }.ToList(), 1);
    }

    private static void ValidateBoardId(string boardId) 
    {
        if (string.IsNullOrWhiteSpace(boardId)) throw new ArgumentException("Board ID is required");
    }

    private static void ValidateFilter(FilterDefinition<TaskDocument> filter)
    {
        if (filter == null) throw new ArgumentException("Invalid filter for board ID");
    }

    private static void ValidateTasks(List<TaskDocument> tasks)
    {
        if (tasks == null || tasks.Count == 0) throw new ArgumentException("No tasks found for the given board ID");
    }

    private static void ValidateUsers(List<UserDocument> users)
    {
        if (users == null || users.Count == 0) throw new ArgumentException("No users found for the given tasks");
    }
    private static void ValidateTaskId(string taskId)
    {
        if (string.IsNullOrWhiteSpace(taskId)) throw new ArgumentException("Task ID is required");
    }
    private static UserSummary Summary(UserDocument user) => new(user.Id, user.Username, user.Email);
}
