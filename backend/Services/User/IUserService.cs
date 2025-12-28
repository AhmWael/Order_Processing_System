using backend.DTOs;

namespace backend.Services;

public interface IUserService
{
    Task<AuthResponseDto> RegisterAsync(UserRegisterDto dto);
    Task<AuthResponseDto> RegisterAdminAsync(UserRegisterDto dto);
    Task<AuthResponseDto> LoginAsync(UserLoginDto dto);
    Task<UserResponseDto?> GetUserByUsernameAsync(string username);
    Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
    Task<AuthResponseDto> RefreshAsync(string refreshToken);
    Task UpdateProfileAsync(Guid userId, UserUpdateDto dto);

}


