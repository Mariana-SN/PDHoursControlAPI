using PDHoursControl.Application.DTOs;

namespace PDHoursControl.Application.Interfaces
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeResponseDto>> GetAllEmployeesAsync();
        Task<int> CreateEmployeeAsync(EmployeeCreateDto dto);
        Task<EmployeeResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<EmployeeResponseDto>> GetBySquadIdAsync(int squadId);
    }
}