using System.Data;
using Dapper;
using backend.Models;

namespace backend.Repositories;

public class AuthorRepository : IAuthorRepository
{
    private readonly IDbConnection _db;

    public AuthorRepository (IDbConnection db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Author>> GetAllAsync()
    {
        const string sql = @"
            SELECT *
            FROM author
            ORDER BY author_name;
        "; 
        return await _db.QueryAsync<Author>(sql);
    }

    public async Task<Author> GetByIdAsync(Guid authorId)
    {
        const string sql = @"
            SELECT *
            FROM author
            WHERE author_id = @AuthorId;
        "; 
        return await _db.QuerySingleOrDefaultAsync<Author>(sql, new { AuthorId = authorId });
    }

    public async Task CreateAsync(Author author)
    {
        const string sql = @"
            INSERT INTO author (author_id, author_name)
            VALUES (@AuthorId, @AuthorName);
        "; 
        await _db.ExecuteAsync(sql, author);
    }

    public async Task UpdateAsync(Author author)
    {
        const string sql = @"
            UPDATE author
            SET author_name = @AuthorName
            WHERE author_id = @AuthorId;
        "; 
        await _db.ExecuteAsync(sql, author);
    }

    public async Task DeleteAsync(Guid AuthorId)
    {
        using var tx = _db.BeginTransaction();

        try
        {
            await _db.ExecuteAsync(
                "DELETE FROM book_authors WHERE author_id = @AuthorId;",
                new { AuthorId },
                tx
            );
            await _db.ExecuteAsync(
                "DELETE FROM author WHERE author_id = @AuthorId;",
                new { AuthorId },
                tx
            );
            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

}