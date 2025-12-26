using System.Text;
using System.Security.Cryptography;
using backend.DTOs;
using backend.Repositories;

namespace backend.Services;

public class CreditCardService : ICreditCardService
{
    private readonly ICreditCardRepository _cardRepo;
    private readonly byte[] _encryptionKey;

    public CreditCardService(ICreditCardRepository cardRepo, IConfiguration configuration)
    {
        _cardRepo = cardRepo;
        
        // Get encryption key from environment variable
        var keyString = configuration["CREDIT_CARD_ENCRYPTION_KEY"] 
            ?? throw new InvalidOperationException("CREDIT_CARD_ENCRYPTION_KEY environment variable is required");
        
        if (keyString.Length != 32)
            throw new InvalidOperationException("CREDIT_CARD_ENCRYPTION_KEY must be exactly 32 characters for AES-256");
        
        _encryptionKey = Encoding.UTF8.GetBytes(keyString);
    }

    private byte[] EncryptCardNumber(string cardNumber)
    {
        using (Aes aes = Aes.Create())
        {
            aes.Key = _encryptionKey;
            aes.GenerateIV(); // Generate a random IV for each encryption

            ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

            using (var msEncrypt = new MemoryStream())
            {
                // Prepend IV to the encrypted data
                msEncrypt.Write(aes.IV, 0, aes.IV.Length);

                using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                using (var swEncrypt = new StreamWriter(csEncrypt))
                {
                    swEncrypt.Write(cardNumber);
                }

                return msEncrypt.ToArray();
            }
        }
    }

    private string DecryptCardNumber(byte[] encryptedData)
    {
        using (Aes aes = Aes.Create())
        {
            aes.Key = _encryptionKey;

            // Extract IV from the beginning of encrypted data
            byte[] iv = new byte[16]; // AES block size is 128 bits = 16 bytes
            Array.Copy(encryptedData, 0, iv, 0, iv.Length);
            aes.IV = iv;

            ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

            using (var msDecrypt = new MemoryStream(encryptedData, iv.Length, encryptedData.Length - iv.Length))
            using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
            using (var srDecrypt = new StreamReader(csDecrypt))
            {
                return srDecrypt.ReadToEnd();
            }
        }
    }

    private bool IsCardExpired(string expirationDate)
    {
        try
        {
            // Expected format: MM/YY
            var parts = expirationDate.Split('/');
            if (parts.Length != 2) return true;

            if (!int.TryParse(parts[0], out int month) || !int.TryParse(parts[1], out int year))
                return true;

            // Convert 2-digit year to 4-digit (assume 20xx)
            year += 2000;

            // Card expires at end of the month
            var expiryDate = new DateTime(year, month, 1).AddMonths(1).AddDays(-1);
            return DateTime.Now.Date > expiryDate;
        }
        catch
        {
            return true; // If parsing fails, consider it expired
        }
    }

    private string ValidateCardNumber(string cardNumber)
    {
        // Remove spaces and dashes
        var cleanedNumber = cardNumber.Replace(" ", "").Replace("-", "");

        // Basic validation: must be 13-19 digits
        if (cleanedNumber.Length < 13 || cleanedNumber.Length > 19)
            throw new Exception("Invalid card number length");

        if (!cleanedNumber.All(char.IsDigit))
            throw new Exception("Card number must contain only digits");

        return cleanedNumber;
    }

    private void ValidateExpirationDate(string expirationDate)
    {
        var parts = expirationDate.Split('/');
        if (parts.Length != 2)
            throw new Exception("Expiration date must be in MM/YY format");

        if (!int.TryParse(parts[0], out int month) || month < 1 || month > 12)
            throw new Exception("Invalid month in expiration date");

        if (!int.TryParse(parts[1], out int year) || year < 0 || year > 99)
            throw new Exception("Invalid year in expiration date");

        if (IsCardExpired(expirationDate))
            throw new Exception("Credit card has expired");
    }

    public async Task<Guid> AddCardAsync(Guid userId, CreditCardAddDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CardholderName))
            throw new Exception("Cardholder name is required");

        // Validate and clean card number
        var cleanedCardNumber = ValidateCardNumber(dto.CardNumber);

        // Validate expiration date
        ValidateExpirationDate(dto.ExpirationDate);

        // Get last 4 digits
        var last4 = cleanedCardNumber.Substring(cleanedCardNumber.Length - 4);

        // Encrypt card number
        var encryptedCardNumber = EncryptCardNumber(cleanedCardNumber);

        return await _cardRepo.AddCardAsync(userId, dto.CardholderName, encryptedCardNumber, last4, dto.ExpirationDate);
    }

    public async Task<IEnumerable<CreditCardDto>> GetUserCardsAsync(Guid userId)
    {
        var cards = await _cardRepo.GetUserCardsAsync(userId);
        
        return cards.Select(c => new CreditCardDto
        {
            CardId = c.CardId,
            CardholderName = c.CardholderName,
            Last4 = c.Last4,
            ExpirationDate = c.ExpirationDate,
            IsExpired = IsCardExpired(c.ExpirationDate)
        });
    }

    public async Task<CreditCardDto?> GetCardByIdAsync(Guid cardId, Guid userId)
    {
        var card = await _cardRepo.GetCardByIdAsync(cardId, userId);
        if (card == null) return null;

        return new CreditCardDto
        {
            CardId = card.CardId,
            CardholderName = card.CardholderName,
            Last4 = card.Last4,
            ExpirationDate = card.ExpirationDate,
            IsExpired = IsCardExpired(card.ExpirationDate)
        };
    }

    public async Task DeleteCardAsync(Guid cardId, Guid userId)
    {
        await _cardRepo.DeleteCardAsync(cardId, userId);
    }

    public async Task<bool> ValidateCardAsync(Guid cardId, Guid userId)
    {
        var card = await _cardRepo.GetCardByIdAsync(cardId, userId);
        
        if (card == null)
            throw new Exception("Credit card not found");

        if (IsCardExpired(card.ExpirationDate))
            throw new Exception($"Credit card ending in {card.Last4} has expired");

        return true;
    }
}
