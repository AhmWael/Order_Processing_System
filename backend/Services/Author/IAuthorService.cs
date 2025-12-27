using backend.DTOs;

namespace backend.Services;
public interface IAuthorService
{
    Task<IEnumerable<AuthorResponseDto>> GetAllAsync();
    Task<AuthorResponseDto?> GetByIdAsync(Guid authorId);
    Task<AuthorResponseDto> CreateAsync(AuthorCreateDto dto);
    Task<bool> UpdateAsync(Guid authorId, AuthorUpdateDto dto);
    Task<bool> DeleteAsync(Guid authorId);
}
