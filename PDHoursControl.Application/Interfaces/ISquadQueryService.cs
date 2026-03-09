using PDHoursControl.Application.DTOs;

namespace PDHoursControl.Application.Interfaces
{
    public interface ISquadQueryService
    {
        Task<IEnumerable<MemberHoursDto>> GetMemberHoursAsync(int squadId, DateTime startDate, DateTime endDate);
        Task<int> GetTotalHoursAsync(int squadId, DateTime startDate, DateTime endDate);
        Task<double> GetAverageHoursPerDayAsync(int squadId, DateTime startDate, DateTime endDate);
    }
}