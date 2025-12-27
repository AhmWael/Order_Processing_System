using backend.DTOs;
using backend.Repositories;

namespace backend.Services;

public class ReportService : IReportService
{
    private readonly IReportRepository _reportRepo;

    public ReportService(IReportRepository reportRepo)
    {
        _reportRepo = reportRepo;
    }

    public async Task<TotalSalesDto> GetTotalSalesPreviousMonthAsync()
    {
        return await _reportRepo.GetTotalSalesPreviousMonthAsync();
    }

    public async Task<TotalSalesDto> GetTotalSalesByDateAsync(DateTime date)
    {
        return await _reportRepo.GetTotalSalesByDateAsync(date);
    }

    public async Task<IEnumerable<TopCustomerDto>> GetTop5CustomersLast3MonthsAsync()
    {
        return await _reportRepo.GetTop5CustomersLast3MonthsAsync();
    }

    public async Task<IEnumerable<TopSellingBookDto>> GetTop10SellingBooksLast3MonthsAsync()
    {
        return await _reportRepo.GetTop10SellingBooksLast3MonthsAsync();
    }

    public async Task<BookOrderCountDto> GetBookReplenishmentOrderCountAsync(string isbn)
    {
        return await _reportRepo.GetBookReplenishmentOrderCountAsync(isbn);
    }
}
