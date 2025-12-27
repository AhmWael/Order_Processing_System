using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/authors")]
public class AuthorController : ControllerBase
{
    private readonly IAuthorService _service;

    public AuthorController(IAuthorService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var authors = await _service.GetAllAsync();
        return Ok(authors);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var author = await _service.GetByIdAsync(id);
        if (author == null) return NotFound();
        return Ok(author);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AuthorCreateDto dto)
    {
        try
        {
            var created = await _service.CreateAsync(dto);
            return Ok(created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the author.", error = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AuthorUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        if (!updated) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            // Handles ON DELETE RESTRICT or other DB constraints
            return Conflict(new { message = ex.Message });
        }
    }
}
