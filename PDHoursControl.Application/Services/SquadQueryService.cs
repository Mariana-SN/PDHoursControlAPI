using PDHoursControl.Application.DTOs;
using PDHoursControl.Application.Interfaces;
using PDHoursControl.Domain.Interfaces;
using PDHoursControl.Shared.Exceptions;

namespace PDHoursControl.Application.Services
{
    public class SquadQueryService : ISquadQueryService
    {
        private readonly IReportRepository _reportRepository;
        private readonly ISquadRepository _squadRepository;

        public SquadQueryService(IReportRepository reportRepository, ISquadRepository squadRepository)
        {
            _reportRepository = reportRepository;
            _squadRepository = squadRepository;
        }

        public async Task<IEnumerable<MemberHoursDto>> GetMemberHoursAsync(int squadId, DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Start date cannot be greater than end date.");

            if (!await _squadRepository.ExistsAsync(squadId))
                throw new ResourceNotFoundException($"Squad with id {squadId} does not exist.");

            var memberHours = await _reportRepository.GetMemberHoursBySquadAndPeriodAsync(squadId, startDate, endDate);

            return memberHours.Select(m => new MemberHoursDto(
                m.EmployeeId,
                m.EmployeeName,
                m.TotalHours
            ));
        }

        public async Task<int> GetTotalHoursAsync(int squadId, DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Start date cannot be greater than end date.");

            if (!await _squadRepository.ExistsAsync(squadId))
                throw new ResourceNotFoundException($"Squad with id {squadId} does not exist.");

            return await _reportRepository.GetTotalHoursBySquadAndPeriodAsync(squadId, startDate, endDate);
        }

        public async Task<double> GetAverageHoursPerDayAsync(int squadId, DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Start date cannot be greater than end date.");

            if (!await _squadRepository.ExistsAsync(squadId))
                throw new ResourceNotFoundException($"Squad with id {squadId} does not exist.");

            return await _reportRepository.GetAverageHoursPerDayBySquadAndPeriodAsync(squadId, startDate, endDate);
        }
    }
}