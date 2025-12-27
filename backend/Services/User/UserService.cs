using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.DTOs;
using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IConfiguration _config;

    public UserService(IUserRepository repo, IPasswordHasher<User> passwordHasher, IConfiguration config)
    {
        _repo = repo;
        _passwordHasher = passwordHasher;
        _config = config;
    }

    public async Task<AuthResponseDto> RegisterAsync(UserRegisterDto dto)
    {
        var existingUser = await _repo.GetByUsernameAsync(dto.Username);
        if (existingUser != null)
            throw new Exception("Username already exists.");

        var existingEmail = await _repo.GetByEmailAsync(dto.Email);
        if (existingEmail != null)
            throw new Exception("Email already in use.");

        var user = new User
        {
            Username = dto.Username,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            Role = "Customer"
        };

        user.Password = _passwordHasher.HashPassword(user, dto.Password);

        await _repo.CreateAsync(user);

        var accessToken = GenerateJwt(user, false);   // short-lived access token
        var refreshToken = GenerateJwt(user, true);   // long-lived refresh token

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            Username = user.Username,
            Role = user.Role
        };
    }

    public async Task<AuthResponseDto> RegisterAdminAsync(UserRegisterDto dto)
    {
        var existingUser = await _repo.GetByUsernameAsync(dto.Username);
        if (existingUser != null)
            throw new Exception("Username already exists.");

        var existingEmail = await _repo.GetByEmailAsync(dto.Email);
        if (existingEmail != null)
            throw new Exception("Email already in use.");

        var user = new User
        {
            Username = dto.Username,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            Role = "Admin"
        };

        user.Password = _passwordHasher.HashPassword(user, dto.Password);

        await _repo.CreateAsync(user);

        var accessToken = GenerateJwt(user, false);   // short-lived access token
        var refreshToken = GenerateJwt(user, true);   // long-lived refresh token

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            Username = user.Username,
            Role = user.Role
        };
    }

    public async Task<AuthResponseDto> LoginAsync(UserLoginDto dto)
    {
        var user = await _repo.GetByLoginAsync(dto.Login);
        if (user == null)
            throw new Exception("Invalid username or password.");

        var result = _passwordHasher.VerifyHashedPassword(user, user.Password, dto.Password);
        if (result == PasswordVerificationResult.Failed)
            throw new Exception("Invalid username or password.");

        var accessToken = GenerateJwt(user, false);
        var refreshToken = GenerateJwt(user, true);

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            Username = user.Username,
            Role = user.Role
        };
    }

    // Helper method to generate JWT
    private string GenerateJwt(User user, bool isRefresh = false)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim("uid", user.UId.ToString()),
            new Claim("role", user.Role),
            new Claim("type", isRefresh ? "refresh" : "access")
        };

        // Set token expiration based on type
        var expires = isRefresh ? DateTime.UtcNow.AddDays(7) : DateTime.UtcNow.AddHours(12);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<AuthResponseDto> RefreshAsync(string refreshToken)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);

        try
        {
            // validate the token
            var principal = tokenHandler.ValidateToken(refreshToken, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _config["Jwt:Issuer"],
                ValidAudience = _config["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key)
            }, out SecurityToken validatedToken);

            var jwt = validatedToken as JwtSecurityToken;

            // make sure it is a refresh token
            if (jwt == null || !jwt.Claims.Any(c => c.Type == "type" && c.Value == "refresh"))
                throw new SecurityTokenException("Invalid refresh token");

            // get username from claims
            var username = principal.Claims.First(c => c.Type == "sub").Value;

            // get user from repo
            var user = await _repo.GetByUsernameAsync(username);
            if (user == null)
                throw new Exception("User not found");

            // generate new tokens
            var newAccessToken = GenerateJwt(user, false);
            //var newRefreshToken = GenerateJwt(user, true); // optional: rotate refresh token

            return new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = refreshToken, // or newRefreshToken if rotating
                Username = user.Username,
                Role = user.Role
            };
        }
        catch
        {
            throw new SecurityTokenException("Invalid refresh token");
        }
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
    {
    var users = await _repo.GetAllAsync();
    return users.Select(u => new UserResponseDto
    {
        UId = u.UId,
        Username = u.Username,
        FirstName = u.FirstName,
        LastName = u.LastName,
        Email = u.Email,
        Phone = u.Phone,
        Address = u.Address,
        Role = u.Role
    });
    }

    public async Task<UserResponseDto?> GetUserByUsernameAsync(string username)
    {
        var user = await _repo.GetByUsernameAsync(username);
        if (user == null)
            return null;

        return new UserResponseDto
        {
            UId = user.UId,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Phone = user.Phone,
            Address = user.Address,
            Role = user.Role
        };
    }

}
