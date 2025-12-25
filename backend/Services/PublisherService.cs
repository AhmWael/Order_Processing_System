using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class PublisherService : IPublisherService
{
    private readonly IPublisherRepository _repo;

    public PublisherService(IPublisherRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<PublisherResponseDto>> GetAllAsync()
    {
        var publishers = await _repo.GetAllAsync();

        return publishers.Select(p => new PublisherResponseDto
        {
            PublisherId = p.PublisherId,
            PublisherName = p.PublisherName,
            Address = p.Address,
            Phones = p.Phones
        });
    }

    public async Task<PublisherResponseDto?> GetByIdAsync(Guid publisherId)
    {
        var publisher = await _repo.GetByIdAsync(publisherId);
        if (publisher == null) return null;

        return new PublisherResponseDto
        {
            PublisherId = publisher.PublisherId,
            PublisherName = publisher.PublisherName,
            Address = publisher.Address,
            Phones = publisher.Phones
        };
    }

    public async Task CreateAsync(PublisherCreateDto dto)
    {
        var publisher = new Publisher
        {
            PublisherId = Guid.NewGuid(),
            PublisherName = dto.PublisherName,
            Address = dto.Address,
            Phones = dto.Phones
        };

        await _repo.CreateAsync(publisher);
    }

    public async Task<bool> UpdateAsync(Guid publisherId, PublisherUpdateDto dto)
    {
        var existing = await _repo.GetByIdAsync(publisherId);
        if (existing == null) return false;

        existing.PublisherName = dto.PublisherName;
        existing.Address = dto.Address;
        existing.Phones = dto.Phones;

        await _repo.UpdateAsync(existing);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid publisherId)
    {
        var existing = await _repo.GetByIdAsync(publisherId);
        if (existing == null) return false;

        await _repo.DeleteAsync(publisherId);
        return true;
    }
}
