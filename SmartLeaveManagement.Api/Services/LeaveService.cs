using Microsoft.EntityFrameworkCore;
using SmartLeaveManagement.Api.Data;
using SmartLeaveManagement.Api.DTOs;
using SmartLeaveManagement.Api.Models;

namespace SmartLeaveManagement.Api.Services
{
    public interface ILeaveService
    {
        Task<LeaveRequest?> CreateRequestAsync(int userId, CreateLeaveRequestDto dto);
        Task<List<LeaveRequest>> GetMyHistoryAsync(int userId);
        Task<List<LeaveRequest>> GetPendingRequestsForManagerAsync(int managerId);
        Task<bool> ApproveRequestAsync(int managerId, int requestId);
        Task<bool> RejectRequestAsync(int managerId, int requestId, string? comment);
        Task<List<LeaveBalance>> GetUserBalancesAsync(int userId);
    }

    public class LeaveService : ILeaveService
    {
        private readonly AppDbContext _context;

        public LeaveService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<LeaveRequest?> CreateRequestAsync(int userId, CreateLeaveRequestDto dto)
        {
            // Validations
            if (dto.StartDate > dto.EndDate) throw new ArgumentException("Start Date cannot be after End Date.");
            if (dto.StartDate < DateOnly.FromDateTime(DateTime.Today)) throw new ArgumentException("Cannot apply for past dates.");

            // Check Balance
            var balance = await _context.LeaveBalances
                .FirstOrDefaultAsync(b => b.UserId == userId && b.LeaveTypeId == dto.LeaveTypeId);

            if (balance == null) throw new InvalidOperationException("Leave balance not found.");

            int requestedDays = CalculateDays(dto.StartDate, dto.EndDate);
            if (balance.RemainingDays < requestedDays) throw new InvalidOperationException($"Insufficient leave balance. Available: {balance.RemainingDays}, Requested: {requestedDays}");

            // Check for Overlapping Leaves
            bool hasOverlap = await _context.LeaveRequests
                .AnyAsync(r => r.UserId == userId 
                            && r.Status != "Rejected" 
                            && ((dto.StartDate >= r.StartDate && dto.StartDate <= r.EndDate)
                                || (dto.EndDate >= r.StartDate && dto.EndDate <= r.EndDate)
                                || (dto.StartDate <= r.StartDate && dto.EndDate >= r.EndDate)));

            if (hasOverlap) throw new InvalidOperationException("Leave request overlaps with an existing leave.");

            // Create Request
            var request = new LeaveRequest
            {
                UserId = userId,
                LeaveTypeId = dto.LeaveTypeId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                Status = "Pending",
                AppliedDate = DateTime.UtcNow
            };

            _context.LeaveRequests.Add(request);
            await _context.SaveChangesAsync();
            return request;
        }

        public async Task<List<LeaveRequest>> GetMyHistoryAsync(int userId)
        {
            return await _context.LeaveRequests
                .Include(r => r.LeaveType)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.AppliedDate)
                .ToListAsync();
        }

        public async Task<List<LeaveRequest>> GetPendingRequestsForManagerAsync(int managerId)
        {
            // Get all employees managed by this manager
            var employeeIds = await _context.Users
                .Where(u => u.ManagerId == managerId)
                .Select(u => u.Id)
                .ToListAsync();

            return await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .Where(r => employeeIds.Contains(r.UserId) && r.Status == "Pending")
                .OrderBy(r => r.StartDate)
                .ToListAsync();
        }

        public async Task<bool> ApproveRequestAsync(int managerId, int requestId)
        {
            var request = await _context.LeaveRequests.FindAsync(requestId);
            if (request == null) throw new InvalidOperationException("Leave request not found.");

            // Helper: Verify manager authority
            var employee = await _context.Users.FindAsync(request.UserId);
            if (employee == null) throw new InvalidOperationException("Employee not found.");
            
            if (employee.ManagerId != managerId) throw new InvalidOperationException($"You are not the manager of this employee. ManagerId is {managerId} but Employee reports to {employee.ManagerId}.");

            if (request.Status != "Pending") throw new InvalidOperationException($"Request status is {request.Status}, not Pending.");

            // Deduct Balance
            var balance = await _context.LeaveBalances
                .FirstOrDefaultAsync(b => b.UserId == request.UserId && b.LeaveTypeId == request.LeaveTypeId);
            
            if (balance == null) throw new InvalidOperationException($"Leave balance record not found for User {request.UserId} and Type {request.LeaveTypeId}.");

            int days = CalculateDays(request.StartDate, request.EndDate);
            if (balance.RemainingDays < days) throw new InvalidOperationException($"Insufficient leave balance. Available: {balance.RemainingDays}, Requested: {days}.");

            balance.UsedDays += days;
            request.Status = "Approved";
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectRequestAsync(int managerId, int requestId, string? comment)
        {
            var request = await _context.LeaveRequests.FindAsync(requestId);
            if (request == null) return false;

            var employee = await _context.Users.FindAsync(request.UserId);
            if (employee == null || employee.ManagerId != managerId) return false;

            if (request.Status != "Pending") return false;

            request.Status = "Rejected";
            request.ManagerComment = comment;

            await _context.SaveChangesAsync();
            return true;
        }
        
        public async Task<List<LeaveBalance>> GetUserBalancesAsync(int userId)
        {
            return await _context.LeaveBalances
                .Include(b => b.LeaveType)
                .Where(b => b.UserId == userId)
                .ToListAsync();
        }

        private int CalculateDays(DateOnly start, DateOnly end)
        {
            // Simple calculation, could exclude weekends in a real app
            // EndDate is inclusive
            return end.DayNumber - start.DayNumber + 1;
        }
    }
}
