using backend.DTOs;
using backend.Repositories;

namespace backend.Services;

public class CustomerOrderService : ICustomerOrderService
{
    private readonly ICustomerOrderRepository _orderRepo;

    public CustomerOrderService(ICustomerOrderRepository orderRepo)
    {
        _orderRepo = orderRepo;
    }

    public async Task<IEnumerable<CustomerOrderDto>> GetUserOrdersAsync(Guid userId)
    {
        var orders = await _orderRepo.GetOrdersAsync(userId);
        var orderDtos = new List<CustomerOrderDto>();

        foreach (var order in orders)
        {
            var items = await _orderRepo.GetOrderItemsAsync(order.OrderId);
            var orderDto = new CustomerOrderDto
            {
                OrderId = order.OrderId,
                OrderDate = order.OrderDate,
                TotalPrice = order.TotalPrice,
                Items = items.Select(i => new CustomerOrderItemDto
                {
                    Isbn = i.Isbn,
                    Title = i.Title ?? "",
                    Quantity = i.Quantity,
                    Price = i.Price
                }).ToList()
            };
            orderDtos.Add(orderDto);
        }

        return orderDtos;
    }
}
