namespace backend.DTOs;

// Total Sales Report
public class TotalSalesDto
{
    public decimal TotalSales { get; set; }
    public int TotalOrders { get; set; }
    public int TotalBooksSold { get; set; }
}

// Top Customer Report
public class TopCustomerDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal TotalPurchaseAmount { get; set; }
    public int TotalOrders { get; set; }
}

// Top Selling Book Report
public class TopSellingBookDto
{
    public string Isbn { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int TotalCopiesSold { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TimesOrdered { get; set; }
}

// Book Order Count Report
public class BookOrderCountDto
{
    public string Isbn { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int ReplenishmentOrderCount { get; set; }
    public int TotalQuantityOrdered { get; set; }
}
