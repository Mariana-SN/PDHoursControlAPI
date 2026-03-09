using Microsoft.EntityFrameworkCore;
using PDHoursControl.Domain.Entities;
using PDHoursControl.Domain.Interfaces;
using PDHoursControl.Infrastructure.Data;

namespace PDHoursControl.Infrastructure.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly PDHoursContext _context;

        public EmployeeRepository(PDHoursContext context)
        {
            _context = context;
        }

        public async Task<Employee?> GetByIdAsync(int id)
        {
            return await _context.Employees
                .Include(e => e.Squad)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<bool> ExistsAsync(int id)
            => await _context.Employees.AnyAsync(e => e.Id == id);

        public async Task AddAsync(Employee employee)
        {
            await _context.Employees.AddAsync(employee);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Employee>> GetBySquadIdAsync(int squadId)
        {
            return await _context.Employees
                .Include(e => e.Squad)  
                .Where(e => e.SquadId == squadId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            return await _context.Employees
                .Include(e => e.Squad)
                .OrderBy(e => e.Name)
                .ToListAsync();
        }
    }
}