namespace backend.DTOs;

public class BookCreateDto
{
    public string Isbn { get; set; }
    public string Title { get; set; }

    public Guid PubId { get; set; }
    public int? PubYear { get; set; }

    public decimal Price { get; set; }
    public string Category { get; set; }

    public int Stock { get; set; }
    public int Threshold { get; set; }

    public List<Guid> AuthorIds { get; set; }
}

public class BookUpdateDto
{
    public string Title { get; set; }

    public Guid PubId { get; set; }
    public int? PubYear { get; set; }

    public decimal Price { get; set; }
    public string Category { get; set; }

    public int Stock { get; set; }
    public int Threshold { get; set; }

    public List<Guid> AuthorIds { get; set; }
}

public class BookResponseDto
{
    public string Isbn { get; set; }
    public string Title { get; set; }

    public Guid PubId { get; set; }
    public int? PubYear { get; set; }

    public decimal Price { get; set; }
    public string Category { get; set; }

    public int Stock { get; set; }
    public int Threshold { get; set; }

    public List<string> Authors { get; set; }
}