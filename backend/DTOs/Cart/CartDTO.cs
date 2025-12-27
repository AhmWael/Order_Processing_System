namespace backend.DTOs;

// Adding/removing items from cart
public class CartItemDto
{
    public string Isbn { get; set; }
    public int Quantity { get; set; }
}

public class CartItemResponseDto
{
    public string Isbn { get; set; }
    public string Title { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Total => Price * Quantity;
}