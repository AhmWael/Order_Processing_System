using System.Data;
using Dapper;
using backend.DTOs;

namespace backend.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly IDbConnection _db;

    public ReportRepository(IDbConnection db)
    {
        _db = db;
    }

    public async Task<TotalSalesDto> GetTotalSalesPreviousMonthAsync()
    {
        const string sql = @"
            SELECT 
                COALESCE(SUM(co.total_price), 0) as TotalSales,
                COUNT(DISTINCT co.order_id) as TotalOrders,
                COALESCE(SUM(oi.quantity), 0) as TotalBooksSold
            FROM customer_order co
            LEFT JOIN customer_order_item oi ON co.order_id = oi.order_id
            WHERE 
                EXTRACT(YEAR FROM co.order_date) = EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))
                AND EXTRACT(MONTH FROM co.order_date) = EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'));
        ";

        var result = await _db.QuerySingleAsync<TotalSalesDto>(sql);
        return result ?? new TotalSalesDto();
    }

    public async Task<TotalSalesDto> GetTotalSalesByDateAsync(DateTime date)
    {
        const string sql = @"
            SELECT 
                COALESCE(SUM(co.total_price), 0) as TotalSales,
                COUNT(DISTINCT co.order_id) as TotalOrders,
                COALESCE(SUM(oi.quantity), 0) as TotalBooksSold
            FROM customer_order co
            LEFT JOIN customer_order_item oi ON co.order_id = oi.order_id
            WHERE co.order_date = @Date::date;
        ";

        var result = await _db.QuerySingleAsync<TotalSalesDto>(sql, new { Date = date });
        return result ?? new TotalSalesDto();
    }

    public async Task<IEnumerable<TopCustomerDto>> GetTop5CustomersLast3MonthsAsync()
    {
        const string sql = @"
            SELECT 
                u.u_id as UserId,
                u.username as Username,
                u.first_name as FirstName,
                u.last_name as LastName,
                u.email as Email,
                COALESCE(SUM(co.total_price), 0) as TotalPurchaseAmount,
                COUNT(co.order_id) as TotalOrders
            FROM ""user"" u
            INNER JOIN customer_order co ON u.u_id = co.u_id
            WHERE co.order_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months'
                AND u.role = 'Customer'
            GROUP BY u.u_id, u.username, u.first_name, u.last_name, u.email
            ORDER BY TotalPurchaseAmount DESC
            LIMIT 5;
        ";

        return await _db.QueryAsync<TopCustomerDto>(sql);
    }

    public async Task<IEnumerable<TopSellingBookDto>> GetTop10SellingBooksLast3MonthsAsync()
    {
        const string sql = @"
            SELECT 
                b.isbn as Isbn,
                b.title as Title,
                COALESCE(SUM(oi.quantity), 0) as TotalCopiesSold,
                COALESCE(SUM(oi.quantity * oi.price), 0) as TotalRevenue,
                COUNT(DISTINCT co.order_id) as TimesOrdered
            FROM book b
            INNER JOIN customer_order_item oi ON b.isbn = oi.isbn
            INNER JOIN customer_order co ON oi.order_id = co.order_id
            WHERE co.order_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months'
            GROUP BY b.isbn, b.title
            ORDER BY TotalCopiesSold DESC
            LIMIT 10;
        ";

        return await _db.QueryAsync<TopSellingBookDto>(sql);
    }

    public async Task<BookOrderCountDto> GetBookReplenishmentOrderCountAsync(string isbn)
    {
        const string sql = @"
            SELECT 
                b.isbn as Isbn,
                b.title as Title,
                COUNT(ro.order_id) as ReplenishmentOrderCount,
                COALESCE(SUM(ro.quantity), 0) as TotalQuantityOrdered
            FROM book b
            LEFT JOIN replenishment_order ro ON b.isbn = ro.isbn
            WHERE b.isbn = @Isbn
            GROUP BY b.isbn, b.title;
        ";

        var result = await _db.QuerySingleOrDefaultAsync<BookOrderCountDto>(sql, new { Isbn = isbn });
        
        if (result == null)
        {
            // Check if book exists
            var bookExists = await _db.QuerySingleOrDefaultAsync<string>(
                "SELECT isbn FROM book WHERE isbn = @Isbn", 
                new { Isbn = isbn }
            );
            
            if (bookExists == null)
                throw new Exception($"Book with ISBN {isbn} not found");
                
            // Book exists but has no replenishment orders
            var bookTitle = await _db.QuerySingleAsync<string>(
                "SELECT title FROM book WHERE isbn = @Isbn", 
                new { Isbn = isbn }
            );
            
            return new BookOrderCountDto
            {
                Isbn = isbn,
                Title = bookTitle,
                ReplenishmentOrderCount = 0,
                TotalQuantityOrdered = 0
            };
        }
        
        return result;
    }
}
