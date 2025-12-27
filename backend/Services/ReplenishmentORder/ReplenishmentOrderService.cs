using backend.DTOs;
using backend.Repositories;

namespace backend.Services;

public class ReplenishmentOrderService : IReplenishmentOrderService
{
    private readonly IReplenishmentOrderRepository _repo;

    public ReplenishmentOrderService(IReplenishmentOrderRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<ReplenishmentOrderResponseDto>> GetAllAsync()
    {
        var orders = await _repo.GetAllAsync();

        return orders.Select(o => new ReplenishmentOrderResponseDto
        {
            OrderId = o.OrderId,
            Isbn = o.Isbn,
            OrderDate = o.OrderDate,
            Quantity = o.Quantity,
            Status = o.Status
        });
    }

    public async Task<bool> ConfirmAsync(Guid orderId)
    {
        var existing = await _repo.GetByIdAsync(orderId);
        if (existing == null || existing.Status == "Confirmed")
            return false;

        await _repo.ConfirmAsync(orderId);
        return true;
    }
}
