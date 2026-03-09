using PDHoursControl.Domain.Entities;

namespace PDHoursControl.Domain.Interfaces
{
    public interface ISquadRepository
    {
        Task<Squad?> GetByIdAsync(int id);
        Task<IEnumerable<Squad>> GetAllAsync();
        Task AddAsync(Squad squad);
        Task<bool> ExistsAsync(int id);
    }
}