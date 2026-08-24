using CollaborativeDashboard.Api.Models;
using CollaborativeDashboard.Api.Services;
using CollaborativeDashboard.Api.Controllers;
using MongoDB.Driver;
using MongoDB.Bson.Serialization.Conventions;

var conventionPack = new ConventionPack { new CamelCaseElementNameConvention() };
ConventionRegistry.Register("collaborative-dashboard-camel-case", conventionPack, _ => true);

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDb"));
builder.Services.AddSingleton<IMongoClient>(_ =>
    new MongoClient(Environment.GetEnvironmentVariable("MONGODB_URI")
        ?? builder.Configuration["MongoDb:ConnectionString"]));
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<BoardService>();
builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<HealthService>();
builder.Services.AddScoped<UsersService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.MapErrors();
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();

//Console.WriteLine("Application is starting...");
//Console.WriteLine("DB connection string {0}", Environment.GetEnvironmentVariable("MONGODB_URI") ?? builder.Configuration["MongoDb:ConnectionString"]);


app.Run();

public partial class Program { }
