using backend.Models;

public interface IReplenishmentOrderRepository
{
    Task<IEnumerable<ReplenishmentOrder>> GetAllAsync();
    Task<ReplenishmentOrder?> GetByIdAsync(Guid orderId);
    Task ConfirmAsync(Guid orderId);
}
