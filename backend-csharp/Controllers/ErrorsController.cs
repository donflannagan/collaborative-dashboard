using Microsoft.AspNetCore.Diagnostics;

namespace CollaborativeDashboard.Api.Controllers;

public static class ErrorsController
{
    public static void MapErrors(this WebApplication app)
    {
        app.UseExceptionHandler(handler => handler.Run(async context =>
        {
            var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = exception is ArgumentException ? 400 : 500;
            var message = exception is ArgumentException ? exception.Message : "Internal Server Error";
            await context.Response.WriteAsJsonAsync(new { success = false, error = message });
        }));
    }
}
