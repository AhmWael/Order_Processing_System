using backend.DTOs;
public interface IReplenishmentOrderService
{
    Task<IEnumerable<ReplenishmentOrderResponseDto>> GetAllAsync();
    Task<bool> ConfirmAsync(Guid orderId);
}
