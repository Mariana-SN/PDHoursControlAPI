using PDHoursControl.Domain.Entities;
using PDHoursControl.Domain.Projections;

namespace PDHoursControl.Domain.Interfaces
{
    public interface IReportRepository
    {
        Task AddAsync(Report report);
        Task<IEnumerable<Report>> GetByEmployeeAndPeriodAsync(int employeeId, DateTime start, DateTime end);
        Task<IEnumerable<Report>> GetBySquadAndPeriodAsync(int squadId, DateTime start, DateTime end);
        Task<IEnumerable<MemberHours>> GetMemberHoursBySquadAndPeriodAsync(int squadId, DateTime start, DateTime end);
        Task<int> GetTotalHoursBySquadAndPeriodAsync(int squadId, DateTime start, DateTime end);
        Task<double> GetAverageHoursPerDayBySquadAndPeriodAsync(int squadId, DateTime start, DateTime end);
        Task<IEnumerable<Report>> GetReportsBySquadAndPeriodWithDetailsAsync(int squadId, DateTime start, DateTime end);
    }
}