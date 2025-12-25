namespace backend.DTOs;
public class PublisherCreateDto
{
    public string PublisherName { get; set; }
    public string? Address { get; set; }

    public List<string> Phones { get; set; } = new();
}

public class PublisherUpdateDto
{
    public string PublisherName { get; set; }
    public string? Address { get; set; }

    public List<string> Phones { get; set; } = new();
}

public class PublisherResponseDto
{
    public Guid PublisherId { get; set; }
    public string PublisherName { get; set; }
    public string? Address { get; set; }

    public List<string> Phones { get; set; } = new();
}