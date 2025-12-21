using backend.DTOs;

namespace backend.Services;

public interface IBookService
{
    Task<IEnumerable<BookResponseDto>> GetAllAsync(string? category);
    Task<BookResponseDto?> GetByIsbnAsync(string isbn);

    Task CreateAsync(BookCreateDto dto);
    Task<bool> UpdateAsync(string isbn, BookUpdateDto dto);
    Task<bool> DeleteAsync(string isbn);
}
