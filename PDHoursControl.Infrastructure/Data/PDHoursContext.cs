using Microsoft.EntityFrameworkCore;
using PDHoursControl.Domain.Entities;

namespace PDHoursControl.Infrastructure.Data
{
    public class PDHoursContext : DbContext
    {
        public PDHoursContext(DbContextOptions<PDHoursContext> options) : base(options) { }

        public DbSet<Squad> Squads { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Report> Reports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Squad>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);
            });

            modelBuilder.Entity<Employee>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);
                entity.Property(e => e.EstimatedHours)
                    .IsRequired();

                entity.HasOne(e => e.Squad)
                    .WithMany(s => s.Employees)
                    .HasForeignKey(e => e.SquadId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.SquadId);
            });

            modelBuilder.Entity<Report>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Description)
                    .IsRequired()
                    .HasMaxLength(500);
                entity.Property(e => e.SpentHours)
                    .IsRequired();
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP")
                    .ValueGeneratedOnAdd();

                entity.HasOne(r => r.Employee)
                    .WithMany(e => e.Reports)
                    .HasForeignKey(r => r.EmployeeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(r => r.EmployeeId);
                entity.HasIndex(r => r.CreatedAt);
            });

            modelBuilder.Entity<Employee>()
                .ToTable(tb => tb.HasCheckConstraint("CK_Employee_EstimatedHours", "\"EstimatedHours\" BETWEEN 1 AND 12"));
        }
    }
}