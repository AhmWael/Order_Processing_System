using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize(Roles = "Customer")]
public class CustomerOrdersController : ControllerBase
{
    private readonly ICustomerOrderService _orderService;

    public CustomerOrdersController(ICustomerOrderService orderService)
    {
        _orderService = orderService;
    }

    private Guid GetUserId()
    {
        var uidClaim = User.FindFirst("uid")?.Value;
        if (string.IsNullOrEmpty(uidClaim))
            throw new UnauthorizedAccessException("User ID not found in token");
        return Guid.Parse(uidClaim);
    }

    // GET /api/orders
    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        try
        {
            var userId = GetUserId();
            var orders = await _orderService.GetUserOrdersAsync(userId);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/orders/history (alias for GET /api/orders)
    [HttpGet("history")]
    public async Task<IActionResult> GetOrderHistory()
    {
        return await GetOrders();
    }
}

