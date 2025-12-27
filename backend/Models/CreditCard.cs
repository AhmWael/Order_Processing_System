namespace backend.Models;

public class CreditCard
{
    public Guid CardId { get; set; }
    public Guid UserId { get; set; }
    public string CardholderName { get; set; } = string.Empty;
    public string ExpirationDate { get; set; } = string.Empty; // MM/YY format
    public byte[] EncryptedCardNumber { get; set; } = Array.Empty<byte>();
    public string Last4 { get; set; } = string.Empty;
    public string Keyver { get; set; } = "v1";
}
