using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text;

namespace backend.Middleware;

public class GlobalRequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalRequestLoggingMiddleware> _logger;

    public GlobalRequestLoggingMiddleware(RequestDelegate next, ILogger<GlobalRequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Log incoming request
        _logger.LogInformation("Incoming Request: {Method} {Path}", context.Request.Method, context.Request.Path);

        // Log request body for POST/PUT
        if (context.Request.Method == HttpMethods.Post || context.Request.Method == HttpMethods.Put)
        {
            context.Request.EnableBuffering();
            using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            context.Request.Body.Position = 0;
            if (!string.IsNullOrWhiteSpace(body))
                _logger.LogInformation("Request Body: {Body}", body);
        }

        try
        {
            await _next(context); // call next middleware/controller
            _logger.LogInformation("Response Status: {StatusCode}", context.Response.StatusCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for request {Method} {Path}", context.Request.Method, context.Request.Path);
            throw;
        }
    }
}
