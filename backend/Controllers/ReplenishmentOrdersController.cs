using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/replenishment-orders")]
//[Authorize(Roles = "Admin")]
public class ReplenishmentOrdersController : ControllerBase
{
    private readonly IReplenishmentOrderService _service;

    public ReplenishmentOrdersController(IReplenishmentOrderService service)
    {
        _service = service;
    }

    // GET all orders
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    // CONFIRM order
    [HttpPut("{orderId}/confirm")]
    public async Task<IActionResult> Confirm(Guid orderId)
    {
        var success = await _service.ConfirmAsync(orderId);
        if (!success)
            return BadRequest("Order not found or already confirmed.");

        return NoContent();
    }
}
