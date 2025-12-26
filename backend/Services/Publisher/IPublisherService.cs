using backend.DTOs;

public interface IPublisherService
{
    Task<IEnumerable<PublisherResponseDto>> GetAllAsync();
    Task<PublisherResponseDto?> GetByIdAsync(Guid publisherId);
    Task CreateAsync(PublisherCreateDto dto);
    Task<bool> UpdateAsync(Guid publisherId, PublisherUpdateDto dto);
    Task<bool> DeleteAsync(Guid publisherId);
}
