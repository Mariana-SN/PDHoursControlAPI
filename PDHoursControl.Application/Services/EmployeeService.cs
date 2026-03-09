using PDHoursControl.Application.DTOs;
using PDHoursControl.Application.Interfaces;
using PDHoursControl.Domain.Entities;
using PDHoursControl.Domain.Interfaces;
using PDHoursControl.Shared.Exceptions;

namespace PDHoursControl.Application.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ISquadRepository _squadRepository;

        public EmployeeService(IEmployeeRepository employeeRepository, ISquadRepository squadRepository)
        {
            _employeeRepository = employeeRepository;
            _squadRepository = squadRepository;
        }

        public async Task<IEnumerable<EmployeeResponseDto>> GetAllEmployeesAsync()
        {
            var employees = await _employeeRepository.GetAllAsync();

            return employees.Select(e => new EmployeeResponseDto(
                Id: e.Id,
                Name: e.Name,
                EstimatedHours: e.EstimatedHours,
                SquadId: e.SquadId,
                SquadName: e.Squad?.Name ?? string.Empty
            ));
        }

        public async Task<int> CreateEmployeeAsync(EmployeeCreateDto dto)
        {
            if (!await _squadRepository.ExistsAsync(dto.SquadId))
                throw new ResourceNotFoundException($"Squad with id {dto.SquadId} does not exist.");

            if (dto.EstimatedHours < 1 || dto.EstimatedHours > 12)
                throw new ArgumentOutOfRangeException(nameof(dto.EstimatedHours), "Estimated hours must be between 1 and 12.");

            var employee = new Employee
            {
                Name = dto.Name,
                EstimatedHours = dto.EstimatedHours,
                SquadId = dto.SquadId
            };

            await _employeeRepository.AddAsync(employee);
            return employee.Id;
        }

        public async Task<EmployeeResponseDto?> GetByIdAsync(int id)
        {
            var employee = await _employeeRepository.GetByIdAsync(id);

            if (employee == null)
                throw new ResourceNotFoundException($"Employee with id {id} does not exist.");

            return new EmployeeResponseDto(
                employee.Id,
                employee.Name,
                employee.EstimatedHours,
                employee.SquadId,
                employee.Squad?.Name ?? string.Empty
             );
        }

        public async Task<IEnumerable<EmployeeResponseDto>> GetBySquadIdAsync(int squadId)
        {
            var employees = await _employeeRepository.GetBySquadIdAsync(squadId);

            return employees.Select(e => new EmployeeResponseDto(
                e.Id,
                e.Name,
                e.EstimatedHours,
                e.SquadId,
                e.Squad?.Name ?? string.Empty
            ));
        }
    }
}