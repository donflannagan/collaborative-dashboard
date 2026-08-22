using CollaborativeDashboard.Api.Models;

namespace CollaborativeDashboard.Api.Models;

public sealed class HealthResponse
{
    // health check type definitions and initial health state
    public string Status { get; set; }
    public DateTime Timestamp { get; set; }
    public TimeSpan Uptime { get; set; }
    public CoreServices Services { get; set; }
}

public sealed class CoreServices
{
    public string Express { get; set; }
    public string Mongodb { get; set; }
}
