using CollaborativeDashboard.Api.Models;
using MongoDB.Driver;

namespace CollaborativeDashboard.Api.Services;

public class UsersService
{
    private readonly MongoDbContext db;

    public UsersService(MongoDbContext db) => this.db = db;

    public virtual async Task<ApiResponse<UserSummary>> GetUserByIdAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync(cancellationToken);
        if (user == null)
        {
            return new ApiResponse<UserSummary>(false, new List<UserSummary>(), 0);
        }

        var data = new UserSummary(
            user.Id,
            user.Username,
            user.Email);
        return new ApiResponse<UserSummary>(true, new[] { data }.ToList(), 1);
    }

    public virtual async Task<ApiResponse<UserSummary>> GetUserByUsernameAsync(string username, CancellationToken cancellationToken)
    {
        var user = await db.Users.Find(u => u.Username == username).FirstOrDefaultAsync(cancellationToken);
        if (user == null)
        {
            return new ApiResponse<UserSummary>(false, new List<UserSummary>(), 0);
        }

        var data = new UserSummary(
            user.Id,
            user.Username,
            user.Email);
        return new ApiResponse<UserSummary>(true, new[] { data }.ToList(), 1);
    }

    public virtual async Task<ApiResponse<UserSummary>> GetUserByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var user = await db.Users.Find(u => u.Email == email).FirstOrDefaultAsync(cancellationToken);
        if (user == null)
        {
            return new ApiResponse<UserSummary>(false, new List<UserSummary>(), 0);
        }

        var data = new UserSummary(
            user.Id,
            user.Username,
            user.Email);
        return new ApiResponse<UserSummary>(true, new[] { data }.ToList(), 1);
    }

    public virtual async Task<ApiResponse<UserSummary>> GetAllUsersAsync(CancellationToken cancellationToken)
    {
        var users = await db.Users.Find(_ => true).ToListAsync(cancellationToken);
        var data = users.Select(user => new UserSummary(
            user.Id,
            user.Username,
            user.Email)).ToList();
        return new ApiResponse<UserSummary>(true, data, data.Count);
    }
    
    public virtual async Task<ApiResponse<UserSummary>> DeleteUserByIdAsync(string userId, CancellationToken cancellationToken)
    {
        var result = await db.Users.DeleteOneAsync(u => u.Id == userId, cancellationToken);
        if (result.DeletedCount == 0)
        {
            return new ApiResponse<UserSummary>(false, new List<UserSummary>(), 0);
        }
        return new ApiResponse<UserSummary>(true, new List<UserSummary>(), 1);
    }

    public virtual async Task<ApiResponse<UserSummary>> UpdateUserByUserId(UserSummary userSummary, CancellationToken cancellationToken)
    {
        var user = await db.Users.Find(u => u.Id == userSummary._id).FirstOrDefaultAsync(cancellationToken);
        if (user == null)
        {
            return new ApiResponse<UserSummary>(false, new List<UserSummary>(), 0);
        }

        var update = Builders<UserDocument>.Update
            .Set(u => u.Username, user.Username)
            .Set(u => u.Email, user.Email);

        var result = await db.Users.UpdateOneAsync(u => u.Id == userSummary._id, update, cancellationToken: cancellationToken);
        if (result.ModifiedCount == 0)
        {
            return new ApiResponse<UserSummary>(false, new List<UserSummary>(), 0);
        }

        var data = new UserSummary(
            user.Id,
            user.Username,
            user.Email);
        return new ApiResponse<UserSummary>(true, new[] { data }.ToList(), 1);
    }

    public virtual async Task<ApiResponse<UserSummary>> CreateUserAsync(UserSummary userSummary, CancellationToken cancellationToken)
    {
        var user = new UserDocument
        {
            Email = userSummary.Email,
            Username = userSummary.Username
        };
        await db.Users.InsertOneAsync(user, cancellationToken: cancellationToken);

        var data = new UserSummary(
            user.Id,
            user.Username,
            user.Email);
        return new ApiResponse<UserSummary>(true, new[] { data }.ToList(), 1);
    }
}

