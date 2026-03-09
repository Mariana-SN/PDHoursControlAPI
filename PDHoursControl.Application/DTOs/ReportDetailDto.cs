namespace PDHoursControl.Application.DTOs
{
    public record ReportDetailDto(int Id, string EmployeeName, string Description, int SpentHours, DateTime CreatedAt
    )
    {
        public string FormattedCreatedAt => CreatedAt.ToString("dd/MM/yyyy");
    }
}