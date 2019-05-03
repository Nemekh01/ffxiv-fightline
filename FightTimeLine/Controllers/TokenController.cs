using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using FightTimeLine.DataLayer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FightTimeLine.Controllers
{
    [Route("api/[controller]")]
    public class TokenController : Controller
    {
        private readonly FightTimelineDataContext _dataContext;
        private readonly IConfiguration _configuration;

        public TokenController(FightTimelineDataContext dataContext, IConfiguration configuration)
        {
            _dataContext = dataContext;
            _configuration = configuration;
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("[action]")]
        public async Task<IActionResult> CreateToken([FromBody] LoginModel login)
        {
            IActionResult response = Unauthorized();
            var user = await Authenticate(login).ConfigureAwait(false);

            if (user != null)
            {
                var tokenString = BuildToken(user);
                response = Ok(new { token = tokenString });
            }

            return response;
        }

        private Task<UserEntity> Authenticate(LoginModel login)
        {
            return _dataContext.Users.SingleOrDefaultAsync(entity => entity.Name == login.Username && entity.Password == login.Password);
        }

        private string BuildToken(UserEntity user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>()
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Name),
            };

            var token = new JwtSecurityToken(_configuration["Jwt:Issuer"],
                _configuration["Jwt:Issuer"],
                expires: null,
                signingCredentials: creds,
                claims: claims);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }


    public class LoginModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
