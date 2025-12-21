using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private readonly IBookService _service;

    public BooksController(IBookService service)
    {
        _service = service;
    }

    // GET /api/books
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category)
    {
        var books = await _service.GetAllAsync(category);
        return Ok(books);
    }

    // GET /api/books/{isbn}
    [HttpGet("{isbn}")]
    public async Task<IActionResult> GetByIsbn(string isbn)
    {
        var book = await _service.GetByIsbnAsync(isbn);
        if (book == null)
            return NotFound();

        return Ok(book);
    }

    // POST /api/books (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookCreateDto dto)
    {
        await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetByIsbn), new { isbn = dto.Isbn }, null);
    }

    // PUT /api/books/{isbn} (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpPut("{isbn}")]
    public async Task<IActionResult> Update(string isbn, [FromBody] BookUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(isbn, dto);
        if (!updated)
            return NotFound();

        return NoContent();
    }

    // DELETE /api/books/{isbn} (Admin only)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{isbn}")]
    public async Task<IActionResult> Delete(string isbn)
    {
        var deleted = await _service.DeleteAsync(isbn);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
