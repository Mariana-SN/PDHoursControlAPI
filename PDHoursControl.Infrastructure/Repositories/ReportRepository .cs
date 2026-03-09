using Microsoft.EntityFrameworkCore;
using PDHoursControl.Domain.Entities;
using PDHoursControl.Domain.Interfaces;
using PDHoursControl.Domain.Projections;
using PDHoursControl.Infrastructure.Data;

namespace PDHoursControl.Infrastructure.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly PDHoursContext _context;

        public ReportRepository(PDHoursContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Report report)
        {
            if (report.CreatedAt.Kind != DateTimeKind.Utc)
            {
                report.CreatedAt = report.CreatedAt.ToUniversalTime();
            }

            await _context.Reports.AddAsync(report);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Report>> GetByEmployeeAndPeriodAsync(int employeeId, DateTime start, DateTime end)
        {
            var startUtc = start.Date.ToUniversalTime();
            var endUtc = end.Date.AddDays(1).AddTicks(-1).ToUniversalTime();

            return await _context.Reports
                .Where(r => r.EmployeeId == employeeId &&
                            r.CreatedAt >= startUtc &&
                            r.CreatedAt <= endUtc)
                .ToListAsync();
        }

        public async Task<IEnumerable<Report>> GetBySquadAndPeriodAsync(int squadId, DateTime start, DateTime end)
        {
            var startUtc = start.Date.ToUniversalTime();
            var endUtc = end.Date.AddDays(1).AddTicks(-1).ToUniversalTime();

            return await _context.Reports
                .Include(r => r.Employee)
                .Where(r => r.Employee.SquadId == squadId &&
                            r.CreatedAt >= startUtc &&
                            r.CreatedAt <= endUtc)
                .ToListAsync();
        }

        public async Task<IEnumerable<MemberHours>> GetMemberHoursBySquadAndPeriodAsync(int squadId, DateTime start, DateTime end)
        {
            var startUtc = start.Date.ToUniversalTime();
            var endUtc = end.Date.AddDays(1).AddTicks(-1).ToUniversalTime();

            var query = from r in _context.Reports
                        join e in _context.Employees on r.EmployeeId equals e.Id
                        where e.SquadId == squadId &&
                              r.CreatedAt >= startUtc &&
                              r.CreatedAt <= endUtc
                        group r by new { e.Id, e.Name } into g
                        select new MemberHours(
                            g.Key.Id,
                            g.Key.Name,
                            g.Sum(r => r.SpentHours)
                        );

            return await query.ToListAsync();
        }

        public async Task<int> GetTotalHoursBySquadAndPeriodAsync(int squadId, DateTime start, DateTime end)
        {
            var startUtc = start.Date.ToUniversalTime();
            var endUtc = end.Date.AddDays(1).AddTicks(-1).ToUniversalTime();

            return await _context.Reports
                .Include(r => r.Employee)
                .Where(r => r.Employee.SquadId == squadId &&
                            r.CreatedAt >= startUtc &&
                            r.CreatedAt <= endUtc)
                .SumAsync(r => r.SpentHours);
        }

        public async Task<double> GetAverageHoursPerDayBySquadAndPeriodAsync(int squadId, DateTime start, DateTime end)
        {
            int totalDays = (end.Date - start.Date).Days + 1;
            if (totalDays <= 0) return 0;

            int totalHours = await GetTotalHoursBySquadAndPeriodAsync(squadId, start, end);
            return (double)totalHours / totalDays;
        }

        public async Task<IEnumerable<Report>> GetReportsBySquadAndPeriodWithDetailsAsync(int squadId, DateTime start, DateTime end)
        {
            var startUtc = start.Date.ToUniversalTime();
            var endUtc = end.Date.AddDays(1).AddTicks(-1).ToUniversalTime();

            return await _context.Reports
                .Include(r => r.Employee)
                .Where(r => r.Employee.SquadId == squadId &&
                            r.CreatedAt >= startUtc &&
                            r.CreatedAt <= endUtc)
                .OrderBy(r => r.Employee.Name)
                .ThenBy(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}