namespace PDHoursControl.Application.DTOs
{
    public record EmployeeResponseDto(int Id, string Name, int EstimatedHours, int SquadId, string SquadName);
}
