using backend.Models;

public interface ICartRepository
{
    Task<Guid> GetCartIdAsync(Guid userId);
    Task<IEnumerable<CartItem>> GetCartItemsAsync(Guid cartId);
    Task AddOrUpdateItemAsync(Guid cartId, string isbn, int quantity);
    Task RemoveItemAsync(Guid cartId, string isbn);
    Task ClearCartAsync(Guid cartId);
}