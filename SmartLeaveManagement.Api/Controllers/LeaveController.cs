using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartLeaveManagement.Api.DTOs;
using SmartLeaveManagement.Api.Models;
using SmartLeaveManagement.Api.Services;
using System.Security.Claims;

namespace SmartLeaveManagement.Api.Controllers
{
    [Route("api/leaves")]
    [ApiController]
    [Authorize]
    public class LeaveController : ControllerBase
    {
        private readonly ILeaveService _leaveService;

        public LeaveController(ILeaveService leaveService)
        {
            _leaveService = leaveService;
        }

        [HttpPost]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> ApplyForLeave([FromBody] CreateLeaveRequestDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                var request = await _leaveService.CreateRequestAsync(userId, dto);
                return CreatedAtAction(nameof(GetMyHistory), new { id = request?.Id }, request);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
        }

        [HttpGet("my-history")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> GetMyHistory()
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var history = await _leaveService.GetMyHistoryAsync(userId);
            return Ok(history);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var managerId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var requests = await _leaveService.GetPendingRequestsForManagerAsync(managerId);
            return Ok(requests);
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> ApproveRequest(int id)
        {
            try 
            {
                var managerId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                await _leaveService.ApproveRequestAsync(managerId, id);
                return Ok(new { message = "Leave request approved." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> RejectRequest(int id, [FromBody] UpdateLeaveStatusDto dto)
        {
            if (dto.Status != "Rejected") return BadRequest("Invalid status.");
            
            var managerId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var success = await _leaveService.RejectRequestAsync(managerId, id, dto.Comment);

            if (!success) return BadRequest("Could not reject request.");

            return Ok(new { message = "Leave request rejected." });
        }
        
        [HttpGet("my-balance")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> GetMyBalance()
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var balances = await _leaveService.GetUserBalancesAsync(userId);
            return Ok(balances);
        }
    }
}
