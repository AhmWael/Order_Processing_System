using backend.DTOs;

namespace backend.Repositories;

public interface IReportRepository
{
    Task<TotalSalesDto> GetTotalSalesPreviousMonthAsync();
    Task<TotalSalesDto> GetTotalSalesByDateAsync(DateTime date);
    Task<IEnumerable<TopCustomerDto>> GetTop5CustomersLast3MonthsAsync();
    Task<IEnumerable<TopSellingBookDto>> GetTop10SellingBooksLast3MonthsAsync();
    Task<BookOrderCountDto> GetBookReplenishmentOrderCountAsync(string isbn);
}
