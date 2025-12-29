namespace backend.Models;

public class ReplenishmentOrder
{
    public Guid OrderId { get; set; }
    public string Isbn { get; set; }
    public DateTime OrderDate { get; set; }
    public int Quantity { get; set; }
    public string Status { get; set; }
}
