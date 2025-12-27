using System.Data;
using Dapper;
using backend.Models;
public class CartRepository : ICartRepository
{
    private readonly IDbConnection _db;
    public CartRepository(IDbConnection db) => _db = db;

    public async Task<Guid> GetCartIdAsync(Guid userId)
    {
        const string sql = @"SELECT cart_id FROM cart WHERE u_id = @UserId;";
        var id = await _db.QuerySingleOrDefaultAsync<Guid?>(sql, new { UserId = userId });
        if (id == null)
        {
            const string insert = @"INSERT INTO cart(u_id) VALUES(@UserId) RETURNING cart_id;";
            id = await _db.ExecuteScalarAsync<Guid>(insert, new { UserId = userId });
        }
        return id.Value;
    }

    public async Task<IEnumerable<CartItem>> GetCartItemsAsync(Guid cartId)
    {
        const string sql = @"
            SELECT ci.isbn, b.title, b.price, ci.quantity
            FROM cart_item ci
            JOIN book b ON ci.isbn = b.isbn
            WHERE ci.cart_id = @CartId;
        ";
        return await _db.QueryAsync<CartItem>(sql, new { CartId = cartId });
    }

    public async Task AddOrUpdateItemAsync(Guid cartId, string isbn, int quantity)
    {
        const string sql = @"
            INSERT INTO cart_item(cart_id, isbn, quantity)
            VALUES(@CartId, @Isbn, @Quantity)
            ON CONFLICT(cart_id, isbn) DO UPDATE
            SET quantity = cart_item.quantity + @Quantity;
        ";
        await _db.ExecuteAsync(sql, new { CartId = cartId, Isbn = isbn, Quantity = quantity });
    }

    public async Task RemoveItemAsync(Guid cartId, string isbn)
    {
        await _db.ExecuteAsync("DELETE FROM cart_item WHERE cart_id = @CartId AND isbn = @Isbn;",
            new { CartId = cartId, Isbn = isbn });
    }

    public async Task ClearCartAsync(Guid cartId)
    {
        await _db.ExecuteAsync("DELETE FROM cart_item WHERE cart_id = @CartId;", new { CartId = cartId });
    }
}