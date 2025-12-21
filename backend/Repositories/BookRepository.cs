using System.Data;
using Dapper;
using backend.Models;

namespace backend.Repositories;

public class BookRepository : IBookRepository
{
    private readonly IDbConnection _db;

    public BookRepository(IDbConnection db)
    {
        _db = db;
    }

    public async Task<Book?> GetByIsbnAsync(string isbn)
    {
        const string sql = @"SELECT * FROM book WHERE isbn = @Isbn;";
        return await _db.QuerySingleOrDefaultAsync<Book>(sql, new { Isbn = isbn });
    }

    public async Task<IEnumerable<Book>> GetAllAsync(string? category = null)
    {
        if (string.IsNullOrEmpty(category))
        {
            const string sqlAll = @"SELECT * FROM book ORDER BY title;";
            return await _db.QueryAsync<Book>(sqlAll);
        }
        else
        {
            const string sqlFiltered = @"SELECT * FROM book WHERE category = @Category ORDER BY title;";
            return await _db.QueryAsync<Book>(sqlFiltered, new { Category = category });
        }
    }

    public async Task CreateAsync(Book book)
    {
        const string sql = @"
            INSERT INTO book (isbn, title, pub_id, pub_year, price, category, stock, threshold)
            VALUES (@Isbn, @Title, @PubId, @PubYear, @Price, @Category, @Stock, @Threshold);
        ";
        await _db.ExecuteAsync(sql, book);
    }

    public async Task UpdateAsync(Book book)
    {
        const string sql = @"
            UPDATE book
            SET title = @Title,
                pub_id = @PubId,
                pub_year = @PubYear,
                price = @Price,
                category = @Category,
                stock = @Stock,
                threshold = @Threshold
            WHERE isbn = @Isbn;
        ";
        await _db.ExecuteAsync(sql, book);
    }

    public async Task DeleteAsync(string isbn)
    {
        const string sql = @"DELETE FROM book WHERE isbn = @Isbn;";
        await _db.ExecuteAsync(sql, new { Isbn = isbn });
    }
}
