using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using CollaborativeDashboard.Api.Controllers;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDb"));
builder.Services.AddSingleton<IMongoClient>(_ =>
    new MongoClient(Environment.GetEnvironmentVariable("MONGODB_URI")
        ?? builder.Configuration["MongoDb:ConnectionString"]));
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<BoardService>();
builder.Services.AddScoped<TaskService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.MapErrors();
app.UseSwagger();
app.UseSwaggerUI();
var healthResponse = () => Results.Ok(new { status = "ok", service = "csharp-backend" });
app.MapGet("/health", healthResponse);
app.MapGet("/api/health", healthResponse);
app.MapControllers();

app.Run();

public partial class Program { }
