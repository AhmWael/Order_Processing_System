using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize(Roles = "Customer")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private Guid GetUserId()
    {
        var uidClaim = User.FindFirst("uid")?.Value;
        if (string.IsNullOrEmpty(uidClaim))
            throw new UnauthorizedAccessException("User ID not found in token");
        return Guid.Parse(uidClaim);
    }

    // GET /api/cart
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        try
        {
            var userId = GetUserId();
            var items = await _cartService.GetCartAsync(userId);
            return Ok(items);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST /api/cart/items
    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] CartItemDto dto)
    {
        try
        {
            var userId = GetUserId();
            await _cartService.AddItemAsync(userId, dto);
            return Ok(new { message = "Item added to cart" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE /api/cart/items/{isbn}
    [HttpDelete("items/{isbn}")]
    public async Task<IActionResult> RemoveItem(string isbn)
    {
        try
        {
            var userId = GetUserId();
            await _cartService.RemoveItemAsync(userId, isbn);
            return Ok(new { message = "Item removed from cart" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST /api/cart/checkout
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
    {
        try
        {
            var userId = GetUserId();
            await _cartService.CheckoutAsync(userId, dto);
            return Ok(new { message = "Order placed successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
