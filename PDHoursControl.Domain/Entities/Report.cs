namespace PDHoursControl.Domain.Entities
{
    public class Report
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;
        public int SpentHours { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
