using CollaborativeDashboard.Api.Models;

namespace CollaborativeDashboard.Api.Models;

public sealed class HealthResponse
{
    // health check type definitions and initial health state
    public required string Status { get; set; }
    public DateTime Timestamp { get; set; }
    public TimeSpan Uptime { get; set; }
    public required CoreServices Services { get; set; }
}

public sealed class CoreServices
{
    public required string  Express { get; set; }
    public required string Mongodb { get; set; }
}
