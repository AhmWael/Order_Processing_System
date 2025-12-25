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
        const string sql = @"
            SELECT b.*, a.author_id, a.author_name
            FROM book b
            LEFT JOIN book_author ba ON b.isbn = ba.isbn
            LEFT JOIN author a ON ba.author_id = a.author_id
            WHERE b.isbn = @Isbn;
        ";

        var bookDict = new Dictionary<string, Book>();

        await _db.QueryAsync<Book, Author, Book>(
            sql,
            (book, author) =>
            {
                if (!bookDict.TryGetValue(book.Isbn, out var existing))
                {
                    existing = book;
                    existing.Authors = new List<Author>();
                    bookDict.Add(book.Isbn, existing);
                }

                if (author != null && author.AuthorId != Guid.Empty)
                    existing.Authors.Add(author);

                return existing;
            },
            new { Isbn = isbn },
            splitOn: "author_id" // <-- FIX: explicitly tell Dapper where Author mapping starts
        );

        return bookDict.Values.FirstOrDefault();
    }

    public async Task<IEnumerable<Book>> GetAllAsync(string? category = null)
    {
        var sql = @"
            SELECT b.*, a.author_id, a.author_name
            FROM book b
            LEFT JOIN book_author ba ON b.isbn = ba.isbn
            LEFT JOIN author a ON ba.author_id = a.author_id
        ";

        if (!string.IsNullOrEmpty(category))
            sql += " WHERE b.category = @Category";

        sql += " ORDER BY b.title;";

        var bookDict = new Dictionary<string, Book>();

        await _db.QueryAsync<Book, Author, Book>(
            sql,
            (book, author) =>
            {
                if (!bookDict.TryGetValue(book.Isbn, out var existing))
                {
                    existing = book;
                    existing.Authors = new List<Author>();
                    bookDict.Add(book.Isbn, existing);
                }

                if (author != null && author.AuthorId != Guid.Empty)
                    existing.Authors.Add(author);

                return existing;
            },
            new { Category = category },
            splitOn: "author_id" // <-- FIX: explicitly set split column
        );

        return bookDict.Values;
    }

    public async Task CreateAsync(Book book, IEnumerable<Guid> authorIds)
    {
        using var tx = _db.BeginTransaction();

        try
        {
            const string insertBook = @"
                INSERT INTO book (isbn, title, pub_id, pub_year, price, category, stock, threshold)
                VALUES (@Isbn, @Title, @PubId, @PubYear, @Price, @Category, @Stock, @Threshold);
            ";

            await _db.ExecuteAsync(insertBook, book, tx);

            const string insertAuthorLink = @"
                INSERT INTO book_author (isbn, author_id)
                VALUES (@Isbn, @AuthorId);
            ";

            foreach (var authorId in authorIds)
            {
                await _db.ExecuteAsync(insertAuthorLink, new { book.Isbn, AuthorId = authorId }, tx);
            }

            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public async Task UpdateAsync(Book book, IEnumerable<Guid> authorIds)
    {
        using var tx = _db.BeginTransaction();

        try
        {
            const string updateBook = @"
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

            await _db.ExecuteAsync(updateBook, book, tx);

            const string deleteAuthors = @"DELETE FROM book_author WHERE isbn = @Isbn;";
            await _db.ExecuteAsync(deleteAuthors, new { book.Isbn }, tx);

            const string insertAuthorLink = @"
                INSERT INTO book_author (isbn, author_id)
                VALUES (@Isbn, @AuthorId);
            ";

            foreach (var authorId in authorIds)
            {
                await _db.ExecuteAsync(insertAuthorLink, new { book.Isbn, AuthorId = authorId }, tx);
            }

            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public async Task DeleteAsync(string isbn)
    {
        using var tx = _db.BeginTransaction();

        try
        {
            await _db.ExecuteAsync("DELETE FROM book_author WHERE isbn = @Isbn;", new { Isbn = isbn }, tx);
            await _db.ExecuteAsync("DELETE FROM book WHERE isbn = @Isbn;", new { Isbn = isbn }, tx);

            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }
}
