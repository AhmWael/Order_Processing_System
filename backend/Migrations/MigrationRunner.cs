using System;
using System.Data;
using System.IO;
using System.Linq;
using Dapper;
using Npgsql;

namespace backend.Migrations
{
    public static class MigrationRunner
    {
        public static void RunMigrations(string connectionString)
        {
            using IDbConnection db = new NpgsqlConnection(connectionString);
            db.Open();

            // Ensure migration history table exists
            db.Execute(@"CREATE TABLE IF NOT EXISTS __MigrationsHistory (
                            MigrationId VARCHAR(50) PRIMARY KEY,
                            AppliedOn TIMESTAMP DEFAULT NOW()
                        );");

            // Get SQL migration files
            var migrationFiles = Directory.GetFiles("Migrations", "*.sql")
                                          .OrderBy(f => f);

            foreach (var file in migrationFiles)
            {
                var migrationId = Path.GetFileName(file);

                var exists = db.QueryFirstOrDefault<int>(
                    "SELECT COUNT(*) FROM __MigrationsHistory WHERE MigrationId = @MigrationId",
                    new { MigrationId = migrationId });

                if (exists == 0)
                {
                    var sql = File.ReadAllText(file);
                    db.Execute(sql);

                    db.Execute("INSERT INTO __MigrationsHistory(MigrationId) VALUES(@MigrationId)",
                               new { MigrationId = migrationId });

                    Console.WriteLine($"Applied migration: {migrationId}");
                }
                else
                {
                    Console.WriteLine($"Skipping migration: {migrationId}");
                }
            }
        }
    }
}
