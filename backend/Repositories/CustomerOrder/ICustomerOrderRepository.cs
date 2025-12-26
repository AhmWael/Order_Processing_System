using backend.Models;

public interface ICustomerOrderRepository
{
    Task<Guid> CreateOrderAsync(Guid userId, decimal totalPrice);
    Task AddOrderItemAsync(Guid orderId, string isbn, int quantity, decimal price);
    Task<IEnumerable<CustomerOrder>> GetOrdersAsync(Guid userId);
    Task<IEnumerable<CustomerOrderItem>> GetOrderItemsAsync(Guid orderId);
}