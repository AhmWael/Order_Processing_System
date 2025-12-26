namespace backend.DTOs;

public class ReplenishmentOrderResponseDto
{
    public Guid OrderId { get; set; }
    public string Isbn { get; set; }
    public DateOnly OrderDate { get; set; }
    public int Quantity { get; set; }
    public string Status { get; set; }
}
