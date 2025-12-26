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
        return await _db.QueryAsync<ReplenishmentOrder>(
            "SELECT * FROM replenishment_order ORDER BY order_date DESC;"
        );
    }

    public async Task<ReplenishmentOrder?> GetByIdAsync(Guid orderId)
    {
        return await _db.QuerySingleOrDefaultAsync<ReplenishmentOrder>(
            "SELECT * FROM replenishment_order WHERE order_id = @OrderId;",
            new { OrderId = orderId }
        );
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
