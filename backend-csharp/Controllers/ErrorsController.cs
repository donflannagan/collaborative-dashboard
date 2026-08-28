using CollaborativeDashboard.Api.Exceptions;
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

            // handle exception
            context.Response.StatusCode = exception switch
            {
                ArgumentException => 400,
                ConflictException => 409,
                _ => 500
            };

            var message = exception switch
            {
                ArgumentException => exception.Message,
                ConflictException => exception.Message,
                _ => exception.Message
            };

            await context.Response.WriteAsJsonAsync(new { success = false, error = message });
        }));
    }
}
