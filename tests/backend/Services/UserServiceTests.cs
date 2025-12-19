using backend.DTOs;
using backend.Models;
using backend.Repositories;
using backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _repoMock;
    private readonly UserService _service;
    private readonly PasswordHasher<User> _passwordHasher;

    public UserServiceTests()
    {
        _repoMock = new Mock<IUserRepository>();
        _passwordHasher = new PasswordHasher<User>();

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Jwt:Key", "TEST_SECRET_KEY_12345678901234567890" },
                { "Jwt:Issuer", "TestIssuer" },
                { "Jwt:Audience", "TestAudience" }
            })
            .Build();

        _service = new UserService(
            _repoMock.Object,
            _passwordHasher,
            config
        );
    }

    // ---------------- REGISTER ----------------

    [Fact]
    public async Task RegisterAsync_CreatesUser_AndReturnsJwt()
    {
        // Arrange
        _repoMock.Setup(r => r.GetByUsernameAsync("jdoe"))
            .ReturnsAsync((User?)null);

        _repoMock.Setup(r => r.GetByEmailAsync("jdoe@example.com"))
            .ReturnsAsync((User?)null);

        _repoMock.Setup(r => r.CreateAsync(It.IsAny<User>()))
         .ReturnsAsync(Guid.NewGuid());

        var dto = new UserRegisterDto
        {
            Username = "jdoe",
            Password = "Password123!",
            FirstName = "John",
            LastName = "Doe",
            Email = "jdoe@example.com"
        };

        // Act
        var result = await _service.RegisterAsync(dto);

        // Assert
        result.Token.Should().NotBeNullOrEmpty();
        result.Username.Should().Be("jdoe");
        result.Role.Should().Be("Customer");

        _repoMock.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_WhenUsernameExists_Throws()
    {
        _repoMock.Setup(r => r.GetByUsernameAsync("jdoe"))
            .ReturnsAsync(new User());

        var dto = new UserRegisterDto { Username = "jdoe" };

        await Assert.ThrowsAsync<Exception>(() => _service.RegisterAsync(dto));
    }

    // ---------------- LOGIN ----------------

    [Fact]
    public async Task LoginAsync_WithUsername_ReturnsJwt()
    {
        var user = new User
        {
            UId = Guid.NewGuid(),
            Username = "jdoe",
            Email = "jdoe@example.com",
            Role = "Customer",
            Password = _passwordHasher.HashPassword(null!, "Password123!")
        };

        _repoMock.Setup(r => r.GetByLoginAsync("jdoe"))
            .ReturnsAsync(user);

        var dto = new UserLoginDto
        {
            Login = "jdoe",
            Password = "Password123!"
        };

        var result = await _service.LoginAsync(dto);

        result.Token.Should().NotBeNullOrEmpty();
        result.Username.Should().Be("jdoe");
    }

    [Fact]
    public async Task LoginAsync_WithEmail_ReturnsJwt()
    {
        var user = new User
        {
            UId = Guid.NewGuid(),
            Username = "jdoe",
            Email = "jdoe@example.com",
            Role = "Customer",
            Password = _passwordHasher.HashPassword(null!, "Password123!")
        };

        _repoMock.Setup(r => r.GetByLoginAsync("jdoe@example.com"))
            .ReturnsAsync(user);

        var dto = new UserLoginDto
        {
            Login = "jdoe@example.com",
            Password = "Password123!"
        };

        var result = await _service.LoginAsync(dto);

        result.Username.Should().Be("jdoe");
        result.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_Throws()
    {
        var user = new User
        {
            Username = "jdoe",
            Password = _passwordHasher.HashPassword(null!, "CorrectPassword")
        };

        _repoMock.Setup(r => r.GetByLoginAsync("jdoe"))
            .ReturnsAsync(user);

        var dto = new UserLoginDto
        {
            Login = "jdoe",
            Password = "WrongPassword"
        };

        await Assert.ThrowsAsync<Exception>(() => _service.LoginAsync(dto));
    }

    // ---------------- GET USERS ----------------

    [Fact]
    public async Task GetAllUsersAsync_ReturnsMappedUsers()
    {
        _repoMock.Setup(r => r.GetAllAsync())
            .ReturnsAsync(new[]
            {
                new User
                {
                    UId = Guid.NewGuid(),
                    Username = "jdoe",
                    FirstName = "John",
                    LastName = "Doe",
                    Role = "Customer"
                }
            });

        var users = await _service.GetAllUsersAsync();

        users.Should().HaveCount(1);
        users.First().Username.Should().Be("jdoe");
    }

    [Fact]
    public async Task GetUserByUsernameAsync_ReturnsUser()
    {
        _repoMock.Setup(r => r.GetByUsernameAsync("jdoe"))
            .ReturnsAsync(new User
            {
                UId = Guid.NewGuid(),
                Username = "jdoe",
                FirstName = "John",
                Role = "Customer"
            });

        var user = await _service.GetUserByUsernameAsync("jdoe");

        user.Should().NotBeNull();
        user!.Username.Should().Be("jdoe");
    }
}
