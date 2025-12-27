using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public interface ICartService
{
    Task<IEnumerable<CartItemResponseDto>> GetCartAsync(Guid userId);
    Task AddItemAsync(Guid userId, CartItemDto dto);
    Task RemoveItemAsync(Guid userId, string isbn);
    Task CheckoutAsync(Guid userId, CheckoutDto dto);
    Task<Guid> ClearCartForUserAsync(Guid userId);
}

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepo;
    private readonly ICustomerOrderRepository _orderRepo;
    private readonly IBookRepository _bookRepo;
    private readonly ICreditCardService _cardService;

    public CartService(ICartRepository cartRepo, ICustomerOrderRepository orderRepo, IBookRepository bookRepo, ICreditCardService cardService)
    {
        _cartRepo = cartRepo;
        _orderRepo = orderRepo;
        _bookRepo = bookRepo;
        _cardService = cardService;
    }

    public async Task<IEnumerable<CartItemResponseDto>> GetCartAsync(Guid userId)
    {
        var cartId = await _cartRepo.GetCartIdAsync(userId);
        var items = await _cartRepo.GetCartItemsAsync(cartId);
        return items.Select(item => new CartItemResponseDto
        {
            Isbn = item.Isbn,
            Title = item.Title,
            Price = item.Price,
            Quantity = item.Quantity
        });
    }

    public async Task AddItemAsync(Guid userId, CartItemDto dto)
    {
        var cartId = await _cartRepo.GetCartIdAsync(userId);
        await _cartRepo.AddOrUpdateItemAsync(cartId, dto.Isbn, dto.Quantity);
    }

    public async Task RemoveItemAsync(Guid userId, string isbn)
    {
        var cartId = await _cartRepo.GetCartIdAsync(userId);
        await _cartRepo.RemoveItemAsync(cartId, isbn);
    }

    public async Task CheckoutAsync(Guid userId, CheckoutDto dto)
    {
        // Validate credit card
        await _cardService.ValidateCardAsync(dto.CardId, userId);

        var cartId = await _cartRepo.GetCartIdAsync(userId);
        var items = (await _cartRepo.GetCartItemsAsync(cartId)).ToList();
        if (!items.Any()) throw new Exception("Cart is empty");

        // Validate stock availability before processing
        foreach (var item in items)
        {
            var book = await _bookRepo.GetByIsbnAsync(item.Isbn);
            if (book == null)
                throw new Exception($"Book with ISBN {item.Isbn} not found");
            if (book.Stock < item.Quantity)
                throw new Exception($"Insufficient stock for {book.Title}. Available: {book.Stock}, Requested: {item.Quantity}");
        }

        decimal total = items.Sum(i => i.Price * i.Quantity);
        var orderId = await _orderRepo.CreateOrderAsync(userId, total);

        foreach (var item in items)
        {
            await _orderRepo.AddOrderItemAsync(orderId, item.Isbn, item.Quantity, item.Price);
            await _bookRepo.UpdateStockAsync(item.Isbn, -item.Quantity); // decrease stock
        }

        await _cartRepo.ClearCartAsync(cartId);
    }

    public async Task<Guid> ClearCartForUserAsync(Guid userId)
    {
        var cartId = await _cartRepo.GetCartIdAsync(userId);
        await _cartRepo.ClearCartAsync(cartId);
        return cartId;
    }
}
