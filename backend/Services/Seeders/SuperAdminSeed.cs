using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Identity;

namespace backend.Services.Seeders;
public static class SuperAdminSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope(); // <--- create a scope
        var repo = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        var username = config["SUPERADMIN_USERNAME"];
        var email = config["SUPERADMIN_EMAIL"];
        var password = config["SUPERADMIN_PASSWORD"];

        var existing = await repo.GetByUsernameAsync(username);
        if (existing != null) return;

        var user = new User
        {
            Username = username,
            FirstName = "Super",
            LastName = "Admin",
            Email = email,
            Role = "Admin",
            Password = hasher.HashPassword(null, password)
        };

        await repo.CreateAsync(user);
    }
}
