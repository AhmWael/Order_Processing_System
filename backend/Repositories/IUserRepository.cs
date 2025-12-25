using backend.Models;

namespace backend.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByLoginAsync(string login);
    Task<IEnumerable<User>> GetAllAsync();
    Task<Guid> CreateAsync(User user);
    

}
