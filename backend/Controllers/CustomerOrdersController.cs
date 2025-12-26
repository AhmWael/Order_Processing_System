using backend.DTOs;
using backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize(Roles = "Customer")]
public class CustomerOrdersController : ControllerBase
{
    private readonly ICustomerOrderRepository _repository;

    public CustomerOrdersController(ICustomerOrderRepository repository)
    {
        _repository = repository;
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
            var orders = await _repository.GetOrdersAsync(userId);
            
            var orderDtos = orders.Select(o => new CustomerOrderDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                TotalPrice = o.TotalPrice,
                Items = new List<CustomerOrderItemDto>() // Items loaded separately
            }).ToList();

            return Ok(orderDtos);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/orders/{orderId}/items
    [HttpGet("{orderId}/items")]
    public async Task<IActionResult> GetOrderItems(Guid orderId)
    {
        try
        {
            var userId = GetUserId();
            
            // Verify the order belongs to the user
            var orders = await _repository.GetOrdersAsync(userId);
            var order = orders.FirstOrDefault(o => o.OrderId == orderId);
            
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            var items = await _repository.GetOrderItemsAsync(orderId);
            
            var itemDtos = items.Select(i => new CustomerOrderItemDto
            {
                Isbn = i.Isbn,
                Title = i.Title ?? "", // Title comes from join in repository query
                Quantity = i.Quantity,
                Price = i.Price
            }).ToList();

            return Ok(itemDtos);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

