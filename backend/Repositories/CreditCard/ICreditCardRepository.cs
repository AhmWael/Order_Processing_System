using backend.Models;

namespace backend.Repositories;

public interface ICreditCardRepository
{
    Task<Guid> AddCardAsync(Guid userId, string cardholderName, byte[] encryptedCardNumber, string last4, string expirationDate);
    Task<IEnumerable<CreditCard>> GetUserCardsAsync(Guid userId);
    Task<CreditCard?> GetCardByIdAsync(Guid cardId, Guid userId);
    Task DeleteCardAsync(Guid cardId, Guid userId);
}
