using backend.Models;

public interface IPublisherRepository
{
    Task<IEnumerable<Publisher>> GetAllAsync();
    Task<Publisher> GetByIdAsync(Guid publisherId);
    Task CreateAsync(Publisher publisher);
    Task UpdateAsync(Publisher publisher);
    Task DeleteAsync(Guid publisherId);
}