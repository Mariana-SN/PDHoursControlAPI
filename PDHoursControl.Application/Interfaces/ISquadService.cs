using PDHoursControl.Application.DTOs;

namespace PDHoursControl.Application.Interfaces
{
    public interface ISquadService
    {
        Task<IEnumerable<SquadDto>> GetAllSquadsAsync();
        Task<int> CreateSquadAsync(SquadCreateDto dto);
        Task<SquadDto?> GetSquadByIdAsync(int id);
    }
}
