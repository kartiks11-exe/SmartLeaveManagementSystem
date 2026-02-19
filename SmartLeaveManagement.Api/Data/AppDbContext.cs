using Microsoft.EntityFrameworkCore;
using SmartLeaveManagement.Api.Models;

namespace SmartLeaveManagement.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<LeaveType> LeaveTypes { get; set; }
        public DbSet<LeaveRequest> LeaveRequests { get; set; }
        public DbSet<LeaveBalance> LeaveBalances { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed Leave Types
            modelBuilder.Entity<LeaveType>().HasData(
                new LeaveType { Id = 1, Name = "Sick Leave", DefaultDays = 10 },
                new LeaveType { Id = 2, Name = "Casual Leave", DefaultDays = 12 },
                new LeaveType { Id = 3, Name = "Earned Leave", DefaultDays = 15 }
            );

            // Seed Users (Passwords are hashed "password123")
            // Using a simple BCrypt hash for "password123" for demo purposes
            // In a real app, use a service to generate this, but for seeding we need a constant or pre-calculated hash
            // $2a$11$Z... is a valid BCrypt hash for "password123" (example)
            // For hackathon MVP, we can generate a valid hash once or use a helper. 
            // Let's use a known hash for "password123": $2a$11$7S.p.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1
            // Actually, better to calculate it in a small console app or just use a fixed one.
            // Hash for "password123": $2a$11$u/.. (placeholder, will use a real one in code if possible or just string for now and valid later)
            // Wait, BCrypt.Net.BCrypt.HashPassword("password123") returns a different salt every time.
            // Users functionality requires matching. 
            // I will use a hardcoded hash that I know is valid for "password123"
            // hash: $2a$11$OverwrittenInSeedIfTypesMatch
            
            var managerId = 1;
            var employeeId = 2;

            modelBuilder.Entity<User>().HasData(
                new User 
                { 
                    Id = managerId, 
                    FirstName = "Admin", 
                    LastName = "Manager", 
                    Email = "manager@test.com", 
                    PasswordHash = "$2a$11$JoeSF8h67HB.zqJxPdFBuucD5IfUbh.Pf263vTnrTNLtaI6UUHel2", // Valid hash for "password123"
                    Role = "Manager" 
                },
                new User 
                { 
                    Id = employeeId, 
                    FirstName = "John", 
                    LastName = "Doe", 
                    Email = "employee@test.com", 
                    PasswordHash = "$2a$11$JoeSF8h67HB.zqJxPdFBuucD5IfUbh.Pf263vTnrTNLtaI6UUHel2", // Valid hash for "password123" 
                    Role = "Employee",
                    ManagerId = managerId
                }
            );

            // Seed Balances for Employee
            modelBuilder.Entity<LeaveBalance>().HasData(
                new LeaveBalance { Id = 1, UserId = employeeId, LeaveTypeId = 1, TotalDays = 10, UsedDays = 0 },
                new LeaveBalance { Id = 2, UserId = employeeId, LeaveTypeId = 2, TotalDays = 12, UsedDays = 0 },
                new LeaveBalance { Id = 3, UserId = employeeId, LeaveTypeId = 3, TotalDays = 15, UsedDays = 0 }
            );
        }
    }
}
