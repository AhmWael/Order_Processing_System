namespace backend.Models;

// Cart and Cart Items
public class Cart
{
    public Guid CartId { get; set; }
    public Guid UserId { get; set; }
}

public class CartItem
{
    public Guid CartId { get; set; }
    public string Isbn { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}
