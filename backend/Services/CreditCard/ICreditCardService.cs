using backend.DTOs;

namespace backend.Services;

public interface ICreditCardService
{
    Task<Guid> AddCardAsync(Guid userId, CreditCardAddDto dto);
    Task<IEnumerable<CreditCardDto>> GetUserCardsAsync(Guid userId);
    Task<CreditCardDto?> GetCardByIdAsync(Guid cardId, Guid userId);
    Task DeleteCardAsync(Guid cardId, Guid userId);
    Task<bool> ValidateCardAsync(Guid cardId, Guid userId);
}
