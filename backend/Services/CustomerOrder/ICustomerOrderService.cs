using backend.DTOs;

namespace backend.Services;

public interface ICustomerOrderService
{
    Task<IEnumerable<CustomerOrderDto>> GetUserOrdersAsync(Guid userId);
}
