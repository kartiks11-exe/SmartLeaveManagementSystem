using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using SmartLeaveManagement.Api.Data;
using SmartLeaveManagement.Api.DTOs;
using SmartLeaveManagement.Api.Models;
using SmartLeaveManagement.Api.Services;
using Xunit;

namespace SmartLeaveManagement.Tests
{
    public class AuthServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            // Setup InMemory Database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB for each test
                .Options;

            _context = new AppDbContext(options);
            _context.Database.EnsureCreated();

            // Mock Configuration for JWT
            _mockConfig = new Mock<IConfiguration>();
            var jwtSection = new Mock<IConfigurationSection>();
            jwtSection.Setup(x => x["SecretKey"]).Returns("ThisIsAVeryLongSecretKeyForTestingPurposesOnly123!");
            jwtSection.Setup(x => x["Issuer"]).Returns("TestIssuer");
            jwtSection.Setup(x => x["Audience"]).Returns("TestAudience");
            _mockConfig.Setup(x => x.GetSection("JwtSettings")).Returns(jwtSection.Object);

            _authService = new AuthService(_context, _mockConfig.Object);

            // Seed Data
            SeedData();
        }

        private void SeedData()
        {
            // The AppDbContext.OnModelCreating might already seed data, but for explicit testing,
            // let's ensure we have known users. 
            // Note: InMemory DB executes OnModelCreating when EnsureCreated is called.
            // But let's add a specific test user to be sure.
            
            // Password hash for "password123": $2a$11$JoeSF8h67HB.zqJxPdFBuucD5IfUbh.Pf263vTnrTNLtaI6UUHel2 (from AppDbContext)
            // If the AppDbContext seeding is running, we might have duplicates if we add same IDs.
            // Let's check if users exist, or just use the seeded ones.
            // To be safe and independent, let's add a new unique user.
            
            var testUser = new User
            {
                Id = 100, // Different from seeded IDs
                FirstName = "Test",
                LastName = "User",
                Email = "testuser@example.com",
                PasswordHash = "$2a$11$JoeSF8h67HB.zqJxPdFBuucD5IfUbh.Pf263vTnrTNLtaI6UUHel2", // hash for "password123"
                Role = "Employee"
            };

            if (_context.Users.Find(100) == null)
            {
                _context.Users.Add(testUser);
                _context.SaveChanges();
            }
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsTokenAndRole()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "testuser@example.com",
                Password = "password123"
            };

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Employee", result.Role);
            Assert.False(string.IsNullOrEmpty(result.Token));
            
            // Verify Token Content (Optional)
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(result.Token);
            var subClaim = token.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            Assert.Equal("testuser@example.com", subClaim);
        }

        [Fact]
        public async Task LoginAsync_WrongPassword_ReturnsNull()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "testuser@example.com",
                Password = "WrongPassword"
            };

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task LoginAsync_NonExistingUser_ReturnsNull()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "nonexisting@example.com",
                Password = "password123"
            };

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.Null(result);
        }
    }
}
