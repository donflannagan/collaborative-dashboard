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
    
}

