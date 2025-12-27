using backend.Models;

namespace backend.Repositories;

public interface IBookRepository
{
    Task<Book?> GetByIsbnAsync(string isbn);
    Task<IEnumerable<Book>> GetAllAsync(string? category = null);
    Task CreateAsync(Book book, IEnumerable<Guid> authorIds);
    Task UpdateAsync(Book book, IEnumerable<Guid> authorIds);
    Task DeleteAsync(string isbn);
    Task UpdateStockAsync(string isbn, int quantityChange);
}
