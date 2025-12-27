using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    // GET /api/reports/sales/previous-month
    [HttpGet("sales/previous-month")]
    public async Task<IActionResult> GetSalesPreviousMonth()
    {
        try
        {
            var result = await _reportService.GetTotalSalesPreviousMonthAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/reports/sales/by-date?date=2025-12-26
    [HttpGet("sales/by-date")]
    public async Task<IActionResult> GetSalesByDate([FromQuery] DateTime date)
    {
        try
        {
            var result = await _reportService.GetTotalSalesByDateAsync(date);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/reports/customers/top-5
    [HttpGet("customers/top-5")]
    public async Task<IActionResult> GetTop5Customers()
    {
        try
        {
            var result = await _reportService.GetTop5CustomersLast3MonthsAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/reports/books/top-10
    [HttpGet("books/top-10")]
    public async Task<IActionResult> GetTop10SellingBooks()
    {
        try
        {
            var result = await _reportService.GetTop10SellingBooksLast3MonthsAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/reports/books/{isbn}/replenishment-orders
    [HttpGet("books/{isbn}/replenishment-orders")]
    public async Task<IActionResult> GetBookReplenishmentOrderCount(string isbn)
    {
        try
        {
            var result = await _reportService.GetBookReplenishmentOrderCountAsync(isbn);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
