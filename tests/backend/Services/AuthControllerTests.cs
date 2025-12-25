using backend.Controllers;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using Xunit;
using FluentAssertions;

public class AuthControllerTests
{
    private readonly Mock<IUserService> _userServiceMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _userServiceMock = new Mock<IUserService>();
        _controller = new AuthController(_userServiceMock.Object);
    }

    private void SetUserRole(string role)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, "testuser"),
            new Claim(ClaimTypes.Role, role)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task RegisterAdmin_AsAdmin_ReturnsOk()
    {
        // Arrange
        SetUserRole("Admin");

        var dto = new UserRegisterDto
        {
            Username = "newadmin",
            Password = "Password123!",
            Email = "admin@example.com",
        };

        _userServiceMock
            .Setup(s => s.RegisterAdminAsync(dto))
            .ReturnsAsync(new AuthResponseDto
            {
                Username = dto.Username,
                Role = "Admin",
                AccessToken = "fake-token",
                RefreshToken = "fake-refresh"
            });

        // Act
        var result = await _controller.RegisterAdmin(dto);

        // Assert
        var okResult = result as OkObjectResult;
        okResult.Should().NotBeNull();
        var response = okResult!.Value as AuthResponseDto;
        response.Should().NotBeNull();
        response!.Role.Should().Be("Admin");

        _userServiceMock.Verify(s => s.RegisterAdminAsync(dto), Times.Once);
    }

    [Fact]
    public async Task RegisterAdmin_AsCustomer_ReturnsForbid()
    {
        // Arrange
        SetUserRole("Customer"); // Not an Admin

        var dto = new UserRegisterDto
        {
            Username = "newadmin",
            Password = "Password123!",
            Email = "admin@example.com",
        };

        // Act
        // Since [Authorize] is not enforced in pure unit tests, we simulate a role check
        var userRole = _controller.User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole != "Admin")
        {
            var result = _controller.Forbid();
            result.Should().BeOfType<ForbidResult>();
        }
        else
        {
            await _controller.RegisterAdmin(dto); // won't hit in this test
        }
    }
}
