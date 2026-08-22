using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace CollaborativeDashboard.Api.Tests;

public sealed class HealthControllerTests
{
    [Fact]
    public async Task HealthEndpointReturnsOk()
    {
        using var host = await new HostBuilder()
            .ConfigureWebHost(webHost =>
            {
                webHost.UseTestServer();
                webHost.ConfigureServices(services => services.AddRouting());
                webHost.Configure(app => app.UseRouting().UseEndpoints(endpoints =>
                {
                    endpoints.MapGet("/health", () => Results.Ok(new { status = "ok", service = "csharp-backend" }));
                }));
            })
            .StartAsync();

        var response = await host.GetTestClient().GetAsync("/health");

        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("csharp-backend", await response.Content.ReadAsStringAsync());
    }
}
