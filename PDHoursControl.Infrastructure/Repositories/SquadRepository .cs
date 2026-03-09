using Microsoft.EntityFrameworkCore;
using PDHoursControl.Domain.Entities;
using PDHoursControl.Domain.Interfaces;
using PDHoursControl.Infrastructure.Data;

namespace PDHoursControl.Infrastructure.Repositories
{
    public class SquadRepository : ISquadRepository
    {
        private readonly PDHoursContext _context;

        public SquadRepository(PDHoursContext context)
        {
            _context = context;
        }

        public async Task<Squad?> GetByIdAsync(int id)
        {
            return await _context.Squads.FindAsync(id);
        }

        public async Task<IEnumerable<Squad>> GetAllAsync()
        {
            return await _context.Squads
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task AddAsync(Squad squad)
        {
            await _context.Squads.AddAsync(squad);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Squads.AnyAsync(s => s.Id == id);
        }
    }
}