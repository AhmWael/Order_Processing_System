namespace backend.DTOs;
// Checkout
public class CheckoutDto
{
    public Guid CardId { get; set; } // Credit card ID to use for checkout
}

// Orders
public class CustomerOrderDto
{
    public Guid OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalPrice { get; set; }
    public List<CustomerOrderItemDto> Items { get; set; } = new();
}

public class CustomerOrderItemDto
{
    public string Isbn { get; set; }
    public string Title { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}