using backend.Controllers;
using backend.DTOs;
using backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

public class UsersControllerTests
{
    private readonly Mock<IUserService> _serviceMock;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _serviceMock = new Mock<IUserService>();
        _controller = new UsersController(_serviceMock.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOkWithUsers()
    {
        // Arrange
        _serviceMock.Setup(s => s.GetAllUsersAsync())
            .ReturnsAsync(new[]
            {
                new UserResponseDto { Username = "jdoe", Role = "Customer" }
            });

        // Act
        var result = await _controller.GetAll();

        // Assert
        var ok = result as OkObjectResult;
        ok.Should().NotBeNull();
        var users = ok!.Value as IEnumerable<UserResponseDto>;
        users.Should().HaveCount(1);
    }
}
