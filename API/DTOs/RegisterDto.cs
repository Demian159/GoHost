using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string DisplayName { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        [RegularExpression("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{4,32}$", 
            ErrorMessage = "Password must contain: At least one Uppercase, Lowercase, one Number, a min of 4 characters and max of 32.")]
        public string Password { get; set; }
        [Required]
        public string Username { get; set; }
    }
}