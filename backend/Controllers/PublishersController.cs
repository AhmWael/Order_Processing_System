using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/publishers")]
public class PublisherController : ControllerBase
{
    private readonly IPublisherService _service;

    public PublisherController(IPublisherService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var publishers = await _service.GetAllAsync();
        return Ok(publishers);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var publisher = await _service.GetByIdAsync(id);
        if (publisher == null) return NotFound();
        return Ok(publisher);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PublisherCreateDto dto)
    {
        await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = dto.PublisherName }, dto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PublisherUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        if (!updated) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
