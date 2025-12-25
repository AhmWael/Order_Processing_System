using System.Data;
using Dapper;
using backend.Models;

namespace backend.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnection _db;

    public UserRepository(IDbConnection db)
    {
        _db = db;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        const string sql = @"SELECT * FROM ""user"" WHERE username = @Username;";
        return await _db.QuerySingleOrDefaultAsync<User>(sql, new { Username = username });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = @"SELECT * FROM ""user"" WHERE email = @Email;";
        return await _db.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<User?> GetByLoginAsync(string login)
    {
        const string sql = @"SELECT * FROM ""user"" WHERE username = @Login OR email = @Login;";
        return await _db.QuerySingleOrDefaultAsync<User>(sql, new { Login = login });
    }


    public async Task<IEnumerable<User>> GetAllAsync()
    {

    const string sql = @"SELECT * FROM ""user"" ORDER BY username;";
    return await _db.QueryAsync<User>(sql);

    }

    public async Task<Guid> CreateAsync(User user)
    {
        const string sql = @"
            INSERT INTO ""user"" (username, password, last_name, first_name, email, phone, address, role)
            VALUES (@Username, @Password, @LastName, @FirstName, @Email, @Phone, @Address, @Role)
            RETURNING u_id;
        ";

        return await _db.ExecuteScalarAsync<Guid>(sql, user);
    }

}
