using System.Data;
using Dapper;
using backend.Models;

namespace backend.Repositories;

public class PublisherRepository : IPublisherRepository
{
    private readonly IDbConnection _db;

    public PublisherRepository(IDbConnection db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Publisher>> GetAllAsync()
    {
        const string sql = @"
            SELECT p.publisher_id, p.publisher_name, p.address, pp.phone
            FROM publisher p
            LEFT JOIN publisher_phone pp ON p.publisher_id = pp.publisher_id
            ORDER BY p.publisher_name;
        ";

        var dict = new Dictionary<Guid, Publisher>();

        await _db.QueryAsync<Publisher, string, Publisher>(
            sql,
            (publisher, phone) =>
            {
                if (!dict.TryGetValue(publisher.PublisherId, out var currentPublisher))
                {
                    currentPublisher = publisher;
                    currentPublisher.Phones = new List<string>();
                    dict.Add(currentPublisher.PublisherId, currentPublisher);
                }

                if (!string.IsNullOrEmpty(phone))
                {
                    currentPublisher.Phones.Add(phone);
                }

                return currentPublisher;
            },
            splitOn: "phone" // must match the column name for second object
        );

        return dict.Values;
    }

    public async Task<Publisher> GetByIdAsync(Guid publisherId)
    {
        const string sql = @"
            SELECT p.publisher_id, p.publisher_name, p.address, pp.phone
            FROM publisher p
            LEFT JOIN publisher_phone pp ON p.publisher_id = pp.publisher_id
            WHERE p.publisher_id = @PublisherId;
        ";

        Publisher? publisher = null;

        await _db.QueryAsync<Publisher, string, Publisher>(
            sql,
            (pub, phone) =>
            {
                if (publisher == null)
                {
                    publisher = pub;
                    publisher.Phones = new List<string>();
                }

                if (!string.IsNullOrEmpty(phone))
                {
                    publisher.Phones.Add(phone);
                }

                return publisher;
            },
            new { PublisherId = publisherId },
            splitOn: "phone"
        );

        return publisher!;
    }

    public async Task CreateAsync(Publisher publisher)
    {
        using var tx = _db.BeginTransaction();

        try
        {
            const string insertPublisher = @"
                INSERT INTO publisher (publisher_id, publisher_name, address)
                VALUES (@PublisherId, @PublisherName, @Address);
            ";
            await _db.ExecuteAsync(insertPublisher, publisher, tx);

            const string insertPhone = @"
                INSERT INTO publisher_phone (publisher_id, phone)
                VALUES (@PublisherId, @Phone);
            ";

            foreach (var phone in publisher.Phones)
            {
                await _db.ExecuteAsync(insertPhone, new { PublisherId = publisher.PublisherId, Phone = phone }, tx);
            }

            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public async Task UpdateAsync(Publisher publisher)
    {
        using var tx = _db.BeginTransaction();

        try
        {
            const string updatePublisher = @"
                UPDATE publisher
                SET publisher_name = @PublisherName,
                    address = @Address
                WHERE publisher_id = @PublisherId;
            ";
            await _db.ExecuteAsync(updatePublisher, publisher, tx);

            await _db.ExecuteAsync(
                "DELETE FROM publisher_phone WHERE publisher_id = @PublisherId;",
                new { publisher.PublisherId },
                tx
            );

            const string insertPhone = @"
                INSERT INTO publisher_phone (publisher_id, phone)
                VALUES (@PublisherId, @Phone);
            ";

            foreach (var phone in publisher.Phones)
            {
                await _db.ExecuteAsync(insertPhone, new { PublisherId = publisher.PublisherId, Phone = phone }, tx);
            }

            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public async Task DeleteAsync(Guid publisherId)
    {
        using var tx = _db.BeginTransaction();

        try
        {
            const string deletePhones = @"
                DELETE FROM publisher_phone
                WHERE publisher_id = @PublisherId;
            ";
            await _db.ExecuteAsync(deletePhones, new { PublisherId = publisherId }, tx);

            const string deletePublisher = @"
                DELETE FROM publisher
                WHERE publisher_id = @PublisherId;
            ";
            await _db.ExecuteAsync(deletePublisher, new { PublisherId = publisherId }, tx);

            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }
}
