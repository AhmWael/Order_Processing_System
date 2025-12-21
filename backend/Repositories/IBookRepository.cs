using backend.Models;

namespace backend.Repositories;

public interface IBookRepository
{
    Task<Book?> GetByIsbnAsync(string isbn);
    Task<IEnumerable<Book>> GetAllAsync(string? category = null);
    Task CreateAsync(Book book);
    Task UpdateAsync(Book book);
    Task DeleteAsync(string isbn);
}
