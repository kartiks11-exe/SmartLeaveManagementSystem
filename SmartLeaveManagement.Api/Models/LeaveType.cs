using System.ComponentModel.DataAnnotations;

namespace SmartLeaveManagement.Api.Models
{
    public class LeaveType
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DefaultDays { get; set; }
    }
}
