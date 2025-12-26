namespace backend.Models;

public class CustomerOrder
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalPrice { get; set; }
    public List<CustomerOrderItem> Items { get; set; } = new();
}

public class CustomerOrderItem
{
    public Guid OrderId { get; set; }
    public string Isbn { get; set; }
    public string? Title { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}