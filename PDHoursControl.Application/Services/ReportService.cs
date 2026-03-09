using PDHoursControl.Application.DTOs;
using PDHoursControl.Application.Interfaces;
using PDHoursControl.Domain.Entities;
using PDHoursControl.Domain.Interfaces;
using PDHoursControl.Shared.Exceptions;

namespace PDHoursControl.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;
        private readonly IEmployeeRepository _employeeRepository;

        public ReportService(IReportRepository reportRepository, IEmployeeRepository employeeRepository)
        {
            _reportRepository = reportRepository;
            _employeeRepository = employeeRepository;
        }

        public async Task<int> CreateReportAsync(ReportCreateDto dto)
        {
            if (!await _employeeRepository.ExistsAsync(dto.EmployeeId))
                throw new ResourceNotFoundException($"Employee with id {dto.EmployeeId} does not exist.");

            var report = new Report
            {
                Description = dto.Description,
                EmployeeId = dto.EmployeeId,
                SpentHours = dto.SpentHours,
                CreatedAt = DateTime.UtcNow
            };

            await _reportRepository.AddAsync(report);
            return report.Id;
        }

        public async Task<IEnumerable<ReportDetailDto>> GetReportsBySquadAndPeriodAsync(int squadId, DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
                throw new ArgumentException("Start date cannot be greater than end date.");

            var reports = await _reportRepository.GetReportsBySquadAndPeriodWithDetailsAsync(squadId, startDate, endDate);

            return reports.Select(r => new ReportDetailDto(
                Id: r.Id,
                EmployeeName: r.Employee?.Name ?? "N/A",
                Description: r.Description,
                SpentHours: r.SpentHours,
                CreatedAt: r.CreatedAt
            ));
        }
    }
}