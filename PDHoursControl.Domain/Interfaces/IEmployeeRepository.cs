using PDHoursControl.Domain.Entities;

namespace PDHoursControl.Domain.Interfaces
{
    public interface IEmployeeRepository
    {
        Task<Employee?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task AddAsync(Employee employee);
        Task<IEnumerable<Employee>> GetBySquadIdAsync(int squadId);
        Task<IEnumerable<Employee>> GetAllAsync();
    }
}