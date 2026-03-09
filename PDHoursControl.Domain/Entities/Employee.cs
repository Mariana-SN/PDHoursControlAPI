namespace PDHoursControl.Domain.Entities
{
    public class Employee
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int EstimatedHours { get; set; } 
        public int SquadId { get; set; }
        public Squad Squad { get; set; } = null!;
        public ICollection<Report> Reports { get; set; } = new List<Report>();
    }
}
