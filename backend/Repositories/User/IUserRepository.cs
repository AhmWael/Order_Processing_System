using backend.Models;
using backend.DTOs;

namespace backend.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByLoginAsync(string login);
    Task<IEnumerable<User>> GetAllAsync();
    Task CreateAsync(User user);
    Task<User?> GetByIdAsync(Guid id);
    Task UpdateProfileAsync(Guid id, UserUpdateDto dto);
    

}
