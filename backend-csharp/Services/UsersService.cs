using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Exceptions;
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
            user.Email,
            user.Password
            );
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
            user.Email,
            user.Password
            );
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
            user.Email,
            user.Password);
        return new ApiResponse<UserSummary>(true, new[] { data }.ToList(), 1);
    }

    public virtual async Task<ApiResponse<UserSummary>> GetAllUsersAsync(CancellationToken cancellationToken)
    {
        var users = await db.Users.Find(_ => true).ToListAsync(cancellationToken);
        var data = users.Select(user => new UserSummary(
            user.Id,
            user.Username,
            user.Email,
            user.Password)).ToList();
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
            .Set(u => u.Username, userSummary.Username)
            .Set(u => u.Email, userSummary.Email)
            .Set(u => u.Password, userSummary.Password);

        var result = await db.Users.UpdateOneAsync(u => u.Id == userSummary._id, update, cancellationToken: cancellationToken);
        if (result.ModifiedCount == 0)
        {
            return new ApiResponse<UserSummary>(false, new List<UserSummary>(), 0);
        }

        var data = new UserSummary(
            userSummary._id,
            userSummary.Username,
            userSummary.Email,
            userSummary.Password);
        return new ApiResponse<UserSummary>(true, new[] { data }.ToList(), 1);
    }

    public virtual async Task<ApiResponse<UserSummary>> CreateUserAsync(UserSummary userSummary, CancellationToken cancellationToken)
    {
        var user = new UserDocument
        {
            Email = userSummary.Email,
            Username = userSummary.Username,
            Password = userSummary.Password
        };

        // Before creating the user, we must verify that the username is unique as is the email address
        var existingUserByUsername = await db.Users.Find(u => u.Username == userSummary.Username).FirstOrDefaultAsync(cancellationToken);
        if (existingUserByUsername != null)
        {
            // return a 409 Conflict response since the username already exists
            Exceptions.ConflictException ex = new Exceptions.ConflictException("Username already exists");
            throw ex;
        }

        var existingUserByEmail = await db.Users.Find(u => u.Email == userSummary.Email).FirstOrDefaultAsync(cancellationToken);
        if (existingUserByEmail != null)
        {
            // return a 409 Conflict response since the email already exists
            Exceptions.ConflictException ex = new Exceptions.ConflictException("Email already exists");
            throw ex;
        }

        // email address and username are unique, we can proceed to insert the new user
        await db.Users.InsertOneAsync(user, cancellationToken: cancellationToken);

        var data = new UserSummary(
            user.Id,
            user.Username,
            user.Email,
            user.Password);
        return new ApiResponse<UserSummary>(true, new[] { data }.ToList(), 1);
    }
}

