using CollaborativeDashboard.Api.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace CollaborativeDashboard.Api.Tests;

[Collection("Mongo")]
public sealed class HealthApiControllerTests(MongoTestFixture fixture)
{
    [Fact]
    public async Task HealthControllerReturnsHealthPayload()
    {
        var result = await new HealthController(new CollaborativeDashboard.Api.Services.HealthService(fixture.Context))
            .HealthCheck();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }
}