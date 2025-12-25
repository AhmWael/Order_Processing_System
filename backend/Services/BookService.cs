using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class BookService : IBookService
{
    private readonly IBookRepository _repo;

    public BookService(IBookRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<BookResponseDto>> GetAllAsync(string? category)
    {
        var books = await _repo.GetAllAsync(category);

        return books.Select(b => new BookResponseDto
        {
            Isbn = b.Isbn,
            Title = b.Title,
            PubId = b.PubId,
            PubYear = b.PubYear,
            Price = b.Price,
            Category = b.Category,
            Stock = b.Stock,
            Threshold = b.Threshold,

            Authors = b.Authors.Select(a => a.AuthorName).ToList()
        });
    }

    public async Task<BookResponseDto?> GetByIsbnAsync(string isbn)
    {
        var book = await _repo.GetByIsbnAsync(isbn);
        if (book == null)
            return null;

        return new BookResponseDto
        {
            Isbn = book.Isbn,
            Title = book.Title,
            PubId = book.PubId,
            PubYear = book.PubYear,
            Price = book.Price,
            Category = book.Category,
            Stock = book.Stock,
            Threshold = book.Threshold,

            Authors = book.Authors.Select(a => a.AuthorName).ToList()
        };
    }

    public async Task CreateAsync(BookCreateDto dto)
    {
        var existing = await _repo.GetByIsbnAsync(dto.Isbn);
        if (existing != null)
            throw new Exception("Book with this ISBN already exists.");

        var book = new Book
        {
            Isbn = dto.Isbn,
            Title = dto.Title,
            PubId = dto.PubId,
            PubYear = dto.PubYear,
            Price = dto.Price,
            Category = dto.Category,
            Stock = dto.Stock,
            Threshold = dto.Threshold
        };

        await _repo.CreateAsync(book, dto.AuthorIds);
    }

    public async Task<bool> UpdateAsync(string isbn, BookUpdateDto dto)
    {
        var existing = await _repo.GetByIsbnAsync(isbn);
        if (existing == null)
            return false;

        existing.Title = dto.Title;
        existing.PubId = dto.PubId;
        existing.PubYear = dto.PubYear;
        existing.Price = dto.Price;
        existing.Category = dto.Category;
        existing.Stock = dto.Stock;
        existing.Threshold = dto.Threshold;

        await _repo.UpdateAsync(existing, dto.AuthorIds);

        return true;
    }

    public async Task<bool> DeleteAsync(string isbn)
    {
        var existing = await _repo.GetByIsbnAsync(isbn);
        if (existing == null)
            return false;

        await _repo.DeleteAsync(isbn);
        return true;
    }
}
