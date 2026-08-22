using CollaborativeDashboard.Api.Models;
using MongoDB.Driver;

namespace CollaborativeDashboard.Api.Services;

public class BoardService
{
    private readonly MongoDbContext db;

    public BoardService(MongoDbContext db) => this.db = db;

    public virtual async Task<ApiResponse<BoardResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var boards = await db.Boards.Find(FilterDefinition<BoardDocument>.Empty).ToListAsync(cancellationToken);
        return await BuildResponse(boards, cancellationToken);
    }

    public virtual async Task<ApiResponse<BoardResponse>> GetBoardsByUserAsync(string userId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("User ID is required");
        var filter = Builders<BoardDocument>.Filter.Or(
            Builders<BoardDocument>.Filter.Eq(board => board.Owner, userId),
            Builders<BoardDocument>.Filter.AnyEq(board => board.Members, userId));
        var boards = await db.Boards.Find(filter).ToListAsync(cancellationToken);
        return await BuildResponse(boards, cancellationToken);
    }

    public virtual async Task<ApiResponse<BoardResponse>> GetBoardByIdAsync(string boardId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(boardId)) throw new ArgumentException("Board ID is required");
        var filter = Builders<BoardDocument>.Filter.Eq(board => board.Id, boardId);
        var board = await db.Boards.Find(filter).FirstOrDefaultAsync(cancellationToken);
        return await BuildResponse(board != null ? new List<BoardDocument> { board } : new List<BoardDocument>(), cancellationToken);
    }

    public virtual async Task<ApiResponse<BoardResponse>> CreateBoardAsync(BoardDocument board, CancellationToken cancellationToken)
    {
        if (board == null) throw new ArgumentNullException(nameof(board));
        await db.Boards.InsertOneAsync(board, null, cancellationToken);
        return await BuildResponse(new List<BoardDocument> { board }, cancellationToken);
    }

    public virtual async Task<ApiResponse<BoardResponse>> UpdateBoardAsync(BoardDocument board, CancellationToken cancellationToken)
    {
        if (board == null) throw new ArgumentNullException(nameof(board));
        var filter = Builders<BoardDocument>.Filter.Eq(b => b.Id, board.Id);
        await db.Boards.ReplaceOneAsync(filter, board, new ReplaceOptions { IsUpsert = false }, cancellationToken);
        return await BuildResponse(new List<BoardDocument> { board }, cancellationToken);
    }

    public virtual async Task<ApiResponse<BoardResponse>> DeleteBoardAsync(string boardId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(boardId)) throw new ArgumentException("Board ID is required");
        var filter = Builders<BoardDocument>.Filter.Eq(board => board.Id, boardId);
        var board = await db.Boards.FindOneAndDeleteAsync(filter, null, cancellationToken);
        return await BuildResponse(board != null ? new List<BoardDocument> { board } : new List<BoardDocument>(), cancellationToken);
    }

    private async Task<ApiResponse<BoardResponse>> BuildResponse(List<BoardDocument> boards, CancellationToken cancellationToken)
    {
        var ids = boards.SelectMany(board => new[] { board.Owner }.Concat(board.Members)).Distinct().ToList();
        var users = await db.Users.Find(Builders<UserDocument>.Filter.In(user => user.Id, ids)).ToListAsync(cancellationToken);
        var byId = users.ToDictionary(user => user.Id);
        var data = boards.Select(board => new BoardResponse(
            board.Id, board.Title, board.Description,
            byId.TryGetValue(board.Owner, out var owner) ? Summary(owner) : null,
            board.Members.Where(byId.ContainsKey).Select(id => Summary(byId[id])).ToList(),
            board.Columns, board.CreatedAt, board.UpdatedAt)).ToList();
        return new ApiResponse<BoardResponse>(true, data, data.Count);
    }

    private static UserSummary Summary(UserDocument user) => new(user.Id, user.Username, user.Email);
}
