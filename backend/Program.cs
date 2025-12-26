using System.Data;
using Npgsql;
using Dapper;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Migrations;
using backend.Repositories;
using backend.Services;
using backend.Services.Seeders;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi;
using Microsoft.VisualBasic;
using Scalar.AspNetCore;
using backend.Middleware;

var builder = WebApplication.CreateBuilder(args);
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

// Load DB Connection
var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING");
if (string.IsNullOrEmpty(connectionString))
    throw new Exception("CONNECTION_STRING environment variable is missing.");

MigrationRunner.RunMigrations(connectionString);

// Controllers
builder.Services.AddControllers();


// Dapper connection
builder.Services.AddScoped<IDbConnection>(sp =>
{
    var conn = new NpgsqlConnection(connectionString);
    conn.Open(); // <-- connection is open for all repositories
    return conn;
});


// DI bindings
// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();
builder.Services.AddScoped<IPublisherRepository, PublisherRepository>();
builder.Services.AddScoped<IReplenishmentOrderRepository, ReplenishmentOrderRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICustomerOrderRepository, CustomerOrderRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<ICreditCardRepository, CreditCardRepository>();

// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IAuthorService, AuthorService>();
builder.Services.AddScoped<IPublisherService, PublisherService>();
builder.Services.AddScoped<IReplenishmentOrderService, ReplenishmentOrderService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<ICreditCardService, CreditCardService>();



builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// JWT
builder.Services
    .AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        var cfg = builder.Configuration;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = cfg["Jwt:Issuer"],
            ValidAudience = cfg["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(cfg["Jwt:Key"])
            )
        };
    });

builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    });

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
// // Swagger configuration
// builder.Services.AddSwaggerGen(c =>
// {
//     c.SwaggerDoc("v1", new OpenApiInfo { Title = "Backend API", Version = "v1" });

//     // Define JWT Bearer scheme
//     c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//     {
//         Type = SecuritySchemeType.Http,
//         Scheme = "bearer",
//         BearerFormat = "JWT",
//         Description = "JWT Authorization header using Bearer scheme"
//     });
// });
builder.Services.AddOpenApi();


// Build and run app
var app = builder.Build();
// Seed Super Admin
await SuperAdminSeeder.SeedAsync(app.Services);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // app.UseSwagger();
    // app.UseSwaggerUI(c =>
    // {
    //     c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    //     c.RoutePrefix = "swagger/"; // Swagger UI at root: http://localhost:5000/
    // });

    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("Backend API")
            .WithTheme(ScalarTheme.Default)
            .WithDefaultHttpClient(ScalarTarget.JavaScript, ScalarClient.HttpClient);
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
// Global logging middleware
app.UseMiddleware<GlobalRequestLoggingMiddleware>();
app.MapControllers();

app.MapGet("/", () => "Hello World!");

// Run the app
app.Run();
