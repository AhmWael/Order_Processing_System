namespace backend.DTOs;

// Add new credit card
public class CreditCardAddDto
{
    public string CardholderName { get; set; } = string.Empty;
    public string CardNumber { get; set; } = string.Empty; // Will be encrypted
    public string ExpirationDate { get; set; } = string.Empty; // MM/YY format
}

// View credit card (no full number)
public class CreditCardDto
{
    public Guid CardId { get; set; }
    public string CardholderName { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public string ExpirationDate { get; set; } = string.Empty;
    public bool IsExpired { get; set; }
}

// For checkout validation
public class CreditCardValidationDto
{
    public Guid CardId { get; set; }
}
