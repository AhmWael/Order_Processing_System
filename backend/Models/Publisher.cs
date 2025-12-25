namespace backend.Models;

public class Publisher
{
    public Guid PublisherId { get; set; }
    public string PublisherName { get; set; }
    public string? Address { get; set; }

    public List<string> Phones { get; set; } = new();
}