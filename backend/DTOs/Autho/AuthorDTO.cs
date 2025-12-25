namespace backend.DTOs;

public class AuthorCreateDto
{
    public string AuthorName { get; set; }
}

public class AuthorUpdateDto
{
    public string AuthorName { get; set; }
}

public class AuthorResponseDto
{
    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; }
}