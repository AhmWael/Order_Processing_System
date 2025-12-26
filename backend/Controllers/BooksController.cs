using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/books")]
[AllowAnonymous] // remove after testing
public class BooksController : ControllerBase
{
    private readonly IBookService _service;

    public BooksController(IBookService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category)
    {
        var books = await _service.GetAllAsync(category);
        return Ok(books);
    }

    [HttpGet("{isbn}")]
    public async Task<IActionResult> GetByIsbn(string isbn)
    {
        var book = await _service.GetByIsbnAsync(isbn);
        if (book == null)
            return NotFound();

        return Ok(book);
    }

    // POST /api/books
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookCreateDto dto)
    {
        if (dto.AuthorIds == null || !dto.AuthorIds.Any())
            return BadRequest("Book must have at least one author.");

        await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetByIsbn), new { isbn = dto.Isbn }, null);
    }

    // PUT /api/books/{isbn}
    [Authorize(Roles = "Admin")]
    [HttpPut("{isbn}")]
    public async Task<IActionResult> Update(string isbn, [FromBody] BookUpdateDto dto)
    {
        if (dto.AuthorIds == null || !dto.AuthorIds.Any())
            return BadRequest("Book must have at least one author.");

        var updated = await _service.UpdateAsync(isbn, dto);
        if (!updated)
            return NotFound();

        return NoContent();
    }

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
