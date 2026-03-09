using PDHoursControl.Application.DTOs;

namespace PDHoursControl.Application.Interfaces
{
    public interface IReportService
    {
        Task<int> CreateReportAsync(ReportCreateDto dto);
        Task<IEnumerable<ReportDetailDto>> GetReportsBySquadAndPeriodAsync(int squadId, DateTime startDate, DateTime endDate);
    }
}