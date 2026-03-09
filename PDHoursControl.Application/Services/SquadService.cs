using PDHoursControl.Application.DTOs;
using PDHoursControl.Application.Interfaces;
using PDHoursControl.Domain.Entities;
using PDHoursControl.Domain.Interfaces;
using PDHoursControl.Shared.Exceptions;

namespace PDHoursControl.Application.Services
{
    public class SquadService : ISquadService
    {
        private readonly ISquadRepository _squadRepository;

        public SquadService(ISquadRepository squadRepository)
        {
            _squadRepository = squadRepository;
        }

        public async Task<IEnumerable<SquadDto>> GetAllSquadsAsync()
        {
            var squads = await _squadRepository.GetAllAsync();

            return squads.Select(s => new SquadDto(
                Id: s.Id,
                Name: s.Name
            ));
        }

        public async Task<int> CreateSquadAsync(SquadCreateDto dto)
        {
            var squad = new Squad
            {
                Name = dto.Name
            };

            await _squadRepository.AddAsync(squad);
            return squad.Id;
        }

        public async Task<SquadDto?> GetSquadByIdAsync(int id)
        {
            var squad = await _squadRepository.GetByIdAsync(id);

            if (squad == null)
                throw new ResourceNotFoundException($"Squad with id {id} does not exist.");

            return new SquadDto(
                Id: squad.Id,
                Name: squad.Name
            );
        }
    }
}