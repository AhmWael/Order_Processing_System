using System.Data;
using Dapper;
using backend.Models;

public class CustomerOrderRepository : ICustomerOrderRepository
{
    private readonly IDbConnection _db;
    public CustomerOrderRepository(IDbConnection db) => _db = db;

    public async Task<Guid> CreateOrderAsync(Guid userId, decimal totalPrice)
    {
        const string sql = @"
            INSERT INTO customer_order(u_id, total_price)
            VALUES(@UserId, @TotalPrice) RETURNING order_id;
        ";
        return await _db.ExecuteScalarAsync<Guid>(sql, new { UserId = userId, TotalPrice = totalPrice });
    }

    public async Task AddOrderItemAsync(Guid orderId, string isbn, int quantity, decimal price)
    {
        const string sql = @"
            INSERT INTO customer_order_item(order_id, isbn, quantity, price)
            VALUES(@OrderId, @Isbn, @Quantity, @Price);
        ";
        await _db.ExecuteAsync(sql, new { OrderId = orderId, Isbn = isbn, Quantity = quantity, Price = price });
    }

    public async Task<IEnumerable<CustomerOrder>> GetOrdersAsync(Guid userId)
    {
        const string sql = @"
            SELECT order_id as OrderId, u_id as UserId, order_date::timestamp as OrderDate, total_price as TotalPrice 
            FROM customer_order 
            WHERE u_id = @UserId 
            ORDER BY order_date DESC;
        ";
        return (await _db.QueryAsync<CustomerOrder>(sql, new { UserId = userId })).ToList();
    }

    public async Task<IEnumerable<CustomerOrderItem>> GetOrderItemsAsync(Guid orderId)
    {
        const string sql = @"
            SELECT coi.isbn, b.title, coi.quantity, coi.price
            FROM customer_order_item coi
            JOIN book b ON coi.isbn = b.isbn
            WHERE coi.order_id = @OrderId;
        ";
        return await _db.QueryAsync<CustomerOrderItem>(sql, new { OrderId = orderId });
    }
}