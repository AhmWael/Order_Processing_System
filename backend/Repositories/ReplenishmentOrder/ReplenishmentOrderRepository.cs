using Dapper;
using System.Data;
using backend.Models;

namespace backend.Repositories;

public class ReplenishmentOrderRepository : IReplenishmentOrderRepository
{
    private readonly IDbConnection _db;

    public ReplenishmentOrderRepository(IDbConnection db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ReplenishmentOrder>> GetAllAsync()
    {
        var orders = await _db.QueryAsync<ReplenishmentOrder>(
            "SELECT * FROM replenishment_order ORDER BY order_date DESC;"
        );
        // Ensure DateTime is marked as UTC
        foreach (var order in orders)
        {
            order.OrderDate = DateTime.SpecifyKind(order.OrderDate, DateTimeKind.Utc);
        }
        return orders;
    }

    public async Task<ReplenishmentOrder?> GetByIdAsync(Guid orderId)
    {
        var order = await _db.QuerySingleOrDefaultAsync<ReplenishmentOrder>(
            "SELECT * FROM replenishment_order WHERE order_id = @OrderId;",
            new { OrderId = orderId }
        );
        if (order != null)
        {
            order.OrderDate = DateTime.SpecifyKind(order.OrderDate, DateTimeKind.Utc);
        }
        return order;
    }

    public async Task ConfirmAsync(Guid orderId)
    {
        const string sql = @"
            UPDATE replenishment_order
            SET status = 'Confirmed'
            WHERE order_id = @OrderId AND status = 'Pending';
        ";

        await _db.ExecuteAsync(sql, new { OrderId = orderId });
    }
}
