using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class AuthorService : IAuthorService
{
    private readonly IAuthorRepository _repo;

    public AuthorService(IAuthorRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<AuthorResponseDto>> GetAllAsync()
    {
        var authors = await _repo.GetAllAsync();

        return authors.Select(a => new AuthorResponseDto
        {
            AuthorId = a.AuthorId,
            AuthorName = a.AuthorName
        });
    }

    public async Task<AuthorResponseDto?> GetByIdAsync(Guid authorId)
    {
        var author = await _repo.GetByIdAsync(authorId);
        if (author == null) return null;

        return new AuthorResponseDto
        {
            AuthorId = author.AuthorId,
            AuthorName = author.AuthorName
        };
    }

    public async Task<AuthorResponseDto> CreateAsync(AuthorCreateDto dto)
    {
        var author = new Author
        {
            AuthorId = Guid.NewGuid(),
            AuthorName = dto.AuthorName
        };

        await _repo.CreateAsync(author);

        return new AuthorResponseDto
        {
            AuthorId = author.AuthorId,
            AuthorName = author.AuthorName
        };
    }

    public async Task<bool> UpdateAsync(Guid authorId, AuthorUpdateDto dto)
    {
        var existing = await _repo.GetByIdAsync(authorId);
        if (existing == null) return false;

        existing.AuthorName = dto.AuthorName;
        await _repo.UpdateAsync(existing);

        return true;
    }

    public async Task<bool> DeleteAsync(Guid authorId)
    {
        var existing = await _repo.GetByIdAsync(authorId);
        if (existing == null) return false;

        await _repo.DeleteAsync(authorId);
        return true;
    }
}
