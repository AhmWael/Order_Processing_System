using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Npgsql;
using System.Diagnostics;
using System.Security.Claims;
using System.Text;

namespace backend.Middleware;

public class GlobalRequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalRequestLoggingMiddleware> _logger;

    public GlobalRequestLoggingMiddleware(
        RequestDelegate next,
        ILogger<GlobalRequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var correlationId = context.TraceIdentifier;

        // Extract user info from JWT (if exists)
        var isAuthenticated = context.User?.Identity?.IsAuthenticated ?? false;
        var userId = context.User?.Claims?.FirstOrDefault(c => c.Type == "uid")?.Value;
        var username = context.User?.Claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value
                       ?? context.User?.Claims?.FirstOrDefault(c => c.Type == "sub")?.Value;

        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId
        }))
        {
            // ---- REQUEST LOGGING ----
            _logger.LogInformation(
                "Incoming Request | {Method} {Path} | Auth={Auth} | UserId={UserId} | Username={Username}",
                context.Request.Method,
                context.Request.Path,
                isAuthenticated,
                userId ?? "anonymous",
                username ?? "anonymous"
            );

            // Log request body (SAFE endpoints only)
            if ((context.Request.Method == HttpMethods.Post ||
                 context.Request.Method == HttpMethods.Put) &&
                 !context.Request.Path.StartsWithSegments("/auth"))
            {
                context.Request.EnableBuffering();

                using var reader = new StreamReader(
                    context.Request.Body,
                    Encoding.UTF8,
                    leaveOpen: true);

                var body = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0;

                if (!string.IsNullOrWhiteSpace(body))
                {
                    _logger.LogInformation("Request Body: {Body}", body);
                }
            }

            try
            {
                await _next(context); // Continue pipeline

                stopwatch.Stop();

                // ---- RESPONSE LOGGING ----
                _logger.LogInformation(
                    "Response | {Method} {Path} | Status={StatusCode} | Time={ElapsedMs}ms",
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode,
                    stopwatch.ElapsedMilliseconds
                );
            }
            catch (PostgresException pgEx)
            {
                stopwatch.Stop();

                // ---- DATABASE ERROR LOGGING ----
                _logger.LogError(
                    pgEx,
                    "Postgres Error | SqlState={SqlState} | Constraint={Constraint} | Message={Message} | Time={ElapsedMs}ms",
                    pgEx.SqlState,
                    pgEx.ConstraintName,
                    pgEx.MessageText,
                    stopwatch.ElapsedMilliseconds
                );

                throw;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();

                // ---- UNHANDLED ERROR LOGGING ----
                _logger.LogError(
                    ex,
                    "Unhandled Exception | {Method} {Path} | Time={ElapsedMs}ms",
                    context.Request.Method,
                    context.Request.Path,
                    stopwatch.ElapsedMilliseconds
                );

                throw;
            }
        }
    }
}
