using System.Threading.Tasks;
using FightTimeLine.DataLayer;
using FightTimeLine.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FightTimeLine.Controllers
{
    [Route("api/[controller]")]
    public class UsersController : Controller
    {
        private readonly FightTimelineDataContext _dataContext;
        private readonly IConfiguration _configuration;

        public UsersController(FightTimelineDataContext dataContext, IConfiguration configuration)
        {
            _dataContext = dataContext;
            _configuration = configuration;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("[action]")]
        public async Task<IActionResult> Exists([FromQuery]string username)
        {
            var userEntity = await _dataContext.Users.FirstOrDefaultAsync(entity => entity.Name == username);
            return Json(userEntity != null);
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("[action]")]
        [CaptchaValidate]
        public async Task<IActionResult> CreateUser([FromBody]RegisterUserModel model)
        {
        

            if (await _dataContext.Users.AnyAsync(entity => entity.Name == model.Username))
                return BadRequest();

            var userEntity = new UserEntity
            {
                Name = model.Username, 
                Password = model.Password
            };
            await _dataContext.Users.AddAsync(userEntity);
            await _dataContext.SaveChangesAsync();

            return Ok();
        }

    }

    public class RegisterUserModel
    {
        public  string Username { get; set; }
        public string Password { get; set; }
    }
}
