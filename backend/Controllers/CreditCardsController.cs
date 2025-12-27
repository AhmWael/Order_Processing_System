using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/credit-cards")]
[Authorize(Roles = "Customer")]
public class CreditCardsController : ControllerBase
{
    private readonly ICreditCardService _cardService;

    public CreditCardsController(ICreditCardService cardService)
    {
        _cardService = cardService;
    }

    private Guid GetUserId()
    {
        var uidClaim = User.FindFirst("uid")?.Value;
        if (string.IsNullOrEmpty(uidClaim))
            throw new UnauthorizedAccessException("User ID not found in token");
        return Guid.Parse(uidClaim);
    }

    // GET /api/credit-cards
    [HttpGet]
    public async Task<IActionResult> GetCards()
    {
        try
        {
            var userId = GetUserId();
            var cards = await _cardService.GetUserCardsAsync(userId);
            return Ok(cards);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/credit-cards/{cardId}
    [HttpGet("{cardId}")]
    public async Task<IActionResult> GetCard(Guid cardId)
    {
        try
        {
            var userId = GetUserId();
            var card = await _cardService.GetCardByIdAsync(cardId, userId);
            
            if (card == null)
                return NotFound(new { message = "Credit card not found" });

            return Ok(card);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST /api/credit-cards
    [HttpPost]
    public async Task<IActionResult> AddCard([FromBody] CreditCardAddDto dto)
    {
        try
        {
            var userId = GetUserId();
            var cardId = await _cardService.AddCardAsync(userId, dto);
            return CreatedAtAction(nameof(GetCard), new { cardId }, new { cardId, message = "Credit card added successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE /api/credit-cards/{cardId}
    [HttpDelete("{cardId}")]
    public async Task<IActionResult> DeleteCard(Guid cardId)
    {
        try
        {
            var userId = GetUserId();
            await _cardService.DeleteCardAsync(cardId, userId);
            return Ok(new { message = "Credit card deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
