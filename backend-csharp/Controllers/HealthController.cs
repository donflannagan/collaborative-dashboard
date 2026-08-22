using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using CollaborativeDashboard.Api.Services;
using CollaborativeDashboard.Api.Models;

namespace CollaborativeDashboard.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly HealthService _healthCheckService;

    public HealthController(HealthService healthService)
    {
        _healthCheckService = healthService;
    }

    [HttpGet]
    public async Task<IActionResult> HealthCheck()
    {
        HealthResponse healthResp = await _healthCheckService.GetHealthStatus();
        return Ok(healthResp);
    }
}