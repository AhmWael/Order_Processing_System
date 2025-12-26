using backend.Models;

public interface IAuthorRepository
{
    Task<IEnumerable<Author>> GetAllAsync();
    Task<Author> GetByIdAsync(Guid authorId);
    Task CreateAsync(Author author);
    Task UpdateAsync(Author author);
    Task DeleteAsync(Guid authorId);
}