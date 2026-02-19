using System.ComponentModel.DataAnnotations;

namespace SmartLeaveManagement.Api.DTOs
{
    public class CreateLeaveRequestDto
    {
        [Required]
        public int LeaveTypeId { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        [Required]
        public DateOnly EndDate { get; set; }

        [Required]
        public string Reason { get; set; } = string.Empty;
    }

    public class UpdateLeaveStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty; // Approved, Rejected

        public string? Comment { get; set; }
    }
}
