using System.Data;
using Dapper;
using backend.Models;

namespace backend.Repositories;

public class CreditCardRepository : ICreditCardRepository
{
    private readonly IDbConnection _db;

    public CreditCardRepository(IDbConnection db)
    {
        _db = db;
    }

    public async Task<Guid> AddCardAsync(Guid userId, string cardholderName, byte[] encryptedCardNumber, string last4, string expirationDate)
    {
        const string sql = @"
            INSERT INTO credit_card (u_id, cardholder_name, encrypted_card_number, last4, expiration_date)
            VALUES (@UserId, @CardholderName, @EncryptedCardNumber, @Last4, @ExpirationDate)
            RETURNING card_id;
        ";

        var cardId = await _db.ExecuteScalarAsync<Guid>(sql, new
        {
            UserId = userId,
            CardholderName = cardholderName,
            EncryptedCardNumber = encryptedCardNumber,
            Last4 = last4,
            ExpirationDate = expirationDate
        });

        return cardId;
    }

    public async Task<IEnumerable<CreditCard>> GetUserCardsAsync(Guid userId)
    {
        const string sql = @"
            SELECT card_id, u_id, cardholder_name, expiration_date, encrypted_card_number, last4, keyver
            FROM credit_card
            WHERE u_id = @UserId
            ORDER BY card_id;
        ";

        return await _db.QueryAsync<CreditCard>(sql, new { UserId = userId });
    }

    public async Task<CreditCard?> GetCardByIdAsync(Guid cardId, Guid userId)
    {
        const string sql = @"
            SELECT card_id, u_id, cardholder_name, expiration_date, encrypted_card_number, last4, keyver
            FROM credit_card
            WHERE card_id = @CardId AND u_id = @UserId;
        ";

        return await _db.QuerySingleOrDefaultAsync<CreditCard>(sql, new { CardId = cardId, UserId = userId });
    }

    public async Task DeleteCardAsync(Guid cardId, Guid userId)
    {
        const string sql = @"
            DELETE FROM credit_card
            WHERE card_id = @CardId AND u_id = @UserId;
        ";

        await _db.ExecuteAsync(sql, new { CardId = cardId, UserId = userId });
    }
}
