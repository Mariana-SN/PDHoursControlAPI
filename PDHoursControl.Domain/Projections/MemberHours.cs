namespace PDHoursControl.Domain.Projections
{
    public record MemberHours(int EmployeeId, string EmployeeName, int TotalHours);
}