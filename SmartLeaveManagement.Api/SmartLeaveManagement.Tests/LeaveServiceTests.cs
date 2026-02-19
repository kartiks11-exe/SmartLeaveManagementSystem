using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartLeaveManagement.Api.Data;
using SmartLeaveManagement.Api.DTOs;
using SmartLeaveManagement.Api.Models;
using SmartLeaveManagement.Api.Services;
using Xunit;

namespace SmartLeaveManagement.Tests
{
    public class LeaveServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly LeaveService _leaveService;

        public LeaveServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();

            _leaveService = new LeaveService(_context);

            SeedData();
        }

        private void SeedData()
        {
            // Note: AppDbContext.OnModelCreating seeds User 1 (Manager) and User 2 (Employee).
            // We adding additional test data with IDs >= 100 to avoid conflicts.

            // Additional Manager
            _context.Users.Add(new User { Id = 100, FirstName = "Manager2", Role = "Manager" });

            // Employees
            // Emp1 (User 101) reports to Manager (User 1 - seeded)
            _context.Users.Add(new User { Id = 101, FirstName = "Emp1", Role = "Employee", ManagerId = 1 });
            // Emp2 (User 102) reports to Manager (User 1 - seeded)
            _context.Users.Add(new User { Id = 102, FirstName = "Emp2", Role = "Employee", ManagerId = 1 });
            // Emp3 (User 103) reports to Manager2 (User 100)
            _context.Users.Add(new User { Id = 103, FirstName = "Emp3", Role = "Employee", ManagerId = 100 });

            // Leave Balances for new employees
            // Leave Types: 1=Sick, 2=Casual, 3=Earned (Seeded)
            _context.LeaveBalances.Add(new LeaveBalance { UserId = 101, LeaveTypeId = 1, TotalDays = 10, UsedDays = 0 }); // 10 remaining
            _context.LeaveBalances.Add(new LeaveBalance { UserId = 102, LeaveTypeId = 1, TotalDays = 10, UsedDays = 8 }); // 2 remaining
            
            _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        // -------------------- Employee Side Tests --------------------

        [Fact]
        public async Task CreateRequestAsync_ValidRequest_Success()
        {
            // Arrange
            var dto = new CreateLeaveRequestDto
            {
                LeaveTypeId = 1,
                StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(2)),
                Reason = "Sick"
            };

            // Act
            var result = await _leaveService.CreateRequestAsync(101, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Pending", result.Status);
        }

        [Fact]
        public async Task CreateRequestAsync_StartDateAfterEndDate_ThrowsArgumentException()
        {
            // Arrange
            var dto = new CreateLeaveRequestDto
            {
                LeaveTypeId = 1,
                StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(4)), // End before Start
                Reason = "Invalid Dates"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _leaveService.CreateRequestAsync(101, dto));
        }

        [Fact]
        public async Task CreateRequestAsync_InsufficientBalance_ThrowsInvalidOperationException()
        {
            // Arrange
            // User 102 has 2 days remaining. Requesting 3 days.
            var dto = new CreateLeaveRequestDto
            {
                LeaveTypeId = 1,
                StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(3)), // 3 days
                Reason = "Long Leave"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _leaveService.CreateRequestAsync(102, dto));
        }

        [Fact]
        public async Task CreateRequestAsync_OverlappingLeave_ShouldFail()
        {
            // Arrange
            // Create an existing leave for User 101: Today to Today+2
            var existingLeave = new LeaveRequest
            {
                UserId = 101,
                LeaveTypeId = 1,
                StartDate = DateOnly.FromDateTime(DateTime.Today),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(2)),
                Status = "Approved"
            };
            _context.LeaveRequests.Add(existingLeave);
            await _context.SaveChangesAsync();

            // Try to apply for overlapping period: Today+1 to Today+3
            var dto = new CreateLeaveRequestDto
            {
                LeaveTypeId = 1,
                StartDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(3)),
                Reason = "Overlap"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _leaveService.CreateRequestAsync(101, dto));
        }
        
        // -------------------- Manager Side Tests --------------------

        [Fact]
        public async Task GetPendingRequestsForManagerAsync_ReturnsOnlyOwnEmployeesRequests()
        {
            // Arrange
            // Emp1 (User 101) reports to Manager 1. Emp3 (User 103) reports to Manager 2 (User 100).
            
            // Create a pending request for Emp1
            var r1 = new LeaveRequest { UserId = 101, LeaveTypeId = 1, StartDate = DateOnly.FromDateTime(DateTime.Today), EndDate = DateOnly.FromDateTime(DateTime.Today), Status = "Pending" };
            _context.LeaveRequests.Add(r1);

            // Create a pending request for Emp3
            var r2 = new LeaveRequest { UserId = 103, LeaveTypeId = 1, StartDate = DateOnly.FromDateTime(DateTime.Today), EndDate = DateOnly.FromDateTime(DateTime.Today), Status = "Pending" };
            _context.LeaveRequests.Add(r2);

            await _context.SaveChangesAsync();

            // Act
            var requestsForManager1 = await _leaveService.GetPendingRequestsForManagerAsync(1); // Manager 1 (Seeded)

            // Assert
            Assert.Contains(requestsForManager1, r => r.Id == r1.Id);
            Assert.DoesNotContain(requestsForManager1, r => r.Id == r2.Id);
        }

        [Fact]
        public async Task ApproveRequestAsync_ValidRequest_SuccessAndDeductsBalance()
        {
            // Arrange
            // Emp1 (User 101) has 10 days balance. Request 2 days.
            var request = new LeaveRequest 
            { 
                UserId = 101, 
                LeaveTypeId = 1, 
                StartDate = DateOnly.FromDateTime(DateTime.Today), 
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)), // 2 days
                Status = "Pending" 
            };
            _context.LeaveRequests.Add(request);
            await _context.SaveChangesAsync();

            // Act
            var result = await _leaveService.ApproveRequestAsync(1, request.Id); // Manager 1 approves

            // Assert
            Assert.True(result);
            
            var updatedRequest = await _context.LeaveRequests.FindAsync(request.Id);
            Assert.Equal("Approved", updatedRequest.Status);

            var balance = await _context.LeaveBalances.FirstAsync(b => b.UserId == 101 && b.LeaveTypeId == 1);
            Assert.Equal(2, balance.UsedDays); // Initial 0 + 2
        }

        [Fact]
        public async Task ApproveRequestAsync_AlreadyApproved_ReturnsFalse()
        {
            // Arrange
            var request = new LeaveRequest 
            { 
                UserId = 101, 
                LeaveTypeId = 1, 
                StartDate = DateOnly.FromDateTime(DateTime.Today), 
                EndDate = DateOnly.FromDateTime(DateTime.Today), 
                Status = "Approved" // Already approved
            };
            _context.LeaveRequests.Add(request);
            await _context.SaveChangesAsync();

            // Act
            var result = await _leaveService.ApproveRequestAsync(1, request.Id);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task ApproveRequestAsync_OtherManagerEmployee_ReturnsFalse()
        {
            // Arrange
            // Emp3 (User 103) reports to Manager 2 (User 100).
            var request = new LeaveRequest 
            { 
                UserId = 103, 
                LeaveTypeId = 1, 
                StartDate = DateOnly.FromDateTime(DateTime.Today), 
                EndDate = DateOnly.FromDateTime(DateTime.Today), 
                Status = "Pending" 
            };
            _context.LeaveRequests.Add(request);
            await _context.SaveChangesAsync();

            // Act
            var result = await _leaveService.ApproveRequestAsync(1, request.Id); // Manager 1 tries to approve

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task RejectRequestAsync_ValidRequest_SuccessAndNoDeduction()
        {
            // Arrange
            var request = new LeaveRequest 
            { 
                UserId = 101, 
                LeaveTypeId = 1, 
                StartDate = DateOnly.FromDateTime(DateTime.Today), 
                EndDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1)), // 2 days
                Status = "Pending" 
            };
            _context.LeaveRequests.Add(request);
            await _context.SaveChangesAsync();

            var initialBalance = await _context.LeaveBalances.FirstAsync(b => b.UserId == 101 && b.LeaveTypeId == 1);
            var initialUsed = initialBalance.UsedDays;

            // Act
            var result = await _leaveService.RejectRequestAsync(1, request.Id, "Rejected");

            // Assert
            Assert.True(result);
            
            var updatedRequest = await _context.LeaveRequests.FindAsync(request.Id);
            Assert.Equal("Rejected", updatedRequest.Status);

            var currentBalance = await _context.LeaveBalances.FirstAsync(b => b.UserId == 101 && b.LeaveTypeId == 1);
            Assert.Equal(initialUsed, currentBalance.UsedDays); // No change
        }
    }
}
