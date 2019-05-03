using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using FightTimeLine.DataLayer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace FightTimeLine.Controllers
{
    [Route("api/[controller]")]
    public class DataController : Controller
    {
        private readonly FightTimelineDataContext _dataContext;

        public DataController(FightTimelineDataContext dataContext)
        {
            _dataContext = dataContext;
        }

        [HttpGet("[action]/{value?}")]
        public async Task<IEnumerable<BossSearchResult>> Search(string value, [FromQuery]string userName, [FromQuery] string secret, [FromQuery]bool privateOnly)
        {
            if (string.IsNullOrWhiteSpace(value) && !privateOnly) return Enumerable.Empty<BossSearchResult>();

            return await _dataContext.Bosses
                .Where(s => (string.IsNullOrWhiteSpace(value) || s.Name.IndexOf(value, StringComparison.OrdinalIgnoreCase) >= 0 || s.Author.IndexOf(value, StringComparison.OrdinalIgnoreCase) >= 0) &&
                            (
                                !s.IsPrivate && !privateOnly || s.IsPrivate && s.UserName != null && s.Secret != null && s.UserName == userName && s.Secret == secret)
                            )
                .Select(s => new BossSearchResult()
                {
                    Id = s.Identifier.ToString(),
                    Name = s.Name,
                    Author = s.Author,
                }).ToArrayAsync();
        }

        [HttpGet("[action]/{id?}")]
        public async Task<IActionResult> Boss(string id, [FromQuery]string userName, [FromQuery]string secret)
        {
            if (!Guid.TryParse(id, out var guid)) guid = Guid.Empty;

            var data = await _dataContext.Bosses.FirstOrDefaultAsync(entity => entity.Identifier == guid);
            if (data == null) return StatusCode(404);

            if (data.IsPrivate && (data.UserName != userName || data.Secret != secret))
                return StatusCode(403);

            return Json(new BossData()
            {
                Id = data.Identifier.ToString(),
                Name = data.Name,
                Author = data.Author,
                UserName = userName,
                Secret = secret,
                Data = data.Data,
                IsPrivate = data.IsPrivate
            });
        }

        [HttpGet("[action]/{id?}")]
        public async Task<IActionResult> Fight(string id)
        {
            if (!Guid.TryParse(id, out var guid)) guid = Guid.Empty;
            var data = await _dataContext.Fights.FirstOrDefaultAsync(entity => entity.Identifier == guid);
            if (data == null) return null;

            return Json(new FightData
            {
                Id = data.Identifier.ToString(),
                Name = data.Name,
                BossRef = data.BossRef != null && data.BossRef != Guid.Empty ? data.BossRef.ToString() : null,
                IsPrivate = data.IsPrivate,
                UserName = data.UserName,
                Secret = null,
                Data = data.Data
            });
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> SaveBoss([FromBody]BossData request)
        {
            if (!Guid.TryParse(request.Id, out var guid)) guid = Guid.Empty;
            var boss = await _dataContext.Bosses.FirstOrDefaultAsync(entity => entity.Identifier == guid);
            if (boss != null)
            {
                if (boss.UserName.Trim() != request.UserName.Trim() || boss.Secret.Trim() != request.Secret.Trim()) return StatusCode(403);
                boss.Name = request.Name;
                boss.Data = request.Data;
                boss.IsPrivate = request.IsPrivate;
                boss.Author = request.Author;
            }
            else
            {
                boss = new BossEntity()
                {
                    Identifier = Guid.NewGuid(),
                    Name = request.Name,
                    Author = request.Author,
                    UserName = request.UserName,
                    Secret = request.Secret,
                    IsPrivate = request.IsPrivate,
                    Data = request.Data,
                };
                _dataContext.Bosses.Add(boss);
            }

            await _dataContext.SaveChangesAsync();

            return Json(new BossData()
            {
                Id = boss.Identifier.ToString(),
                Name = boss.Name,
                Author = boss.Author,
                UserName = boss.UserName,
                Secret = boss.Secret,
                Data = "",
                IsPrivate = boss.IsPrivate
            });
        }

        [HttpPost("[action]")]
        [Authorize]
        public async Task<IActionResult> SaveFight([FromBody]FightData request)
        {
            foreach (var userClaim in HttpContext.User.Claims)
            {
                Console.WriteLine(userClaim.Type + ":" + userClaim.Value);
            }

            var nameClaim = HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Sub);
            if (nameClaim == null)
                return Unauthorized();


            if (!Guid.TryParse(request.Id, out var guid)) guid = Guid.Empty;
            var fight = await _dataContext.Fights.FirstOrDefaultAsync(entity => entity.Identifier == guid);
            if (fight != null)
            {
                if (fight.UserName.Trim() != nameClaim.Value) return Unauthorized();

                fight.Name = request.Name;
                fight.Data = request.Data;
                fight.IsPrivate = request.IsPrivate;
                fight.Author = request.Author;
            }
            else
            {
                fight = new FightEntity()
                {
                    Identifier = Guid.NewGuid(),
                    BossRef = Guid.Empty,
                    Name = request.Name,
                    Author = request.Author,
                    UserName = nameClaim.Value,
                    Secret = request.Secret,
                    IsPrivate = request.IsPrivate,
                    Data = request.Data,
                };
                _dataContext.Fights.Add(fight);
            }

            await _dataContext.SaveChangesAsync();

            return Json(new FightData
            {
                Id = fight.Identifier.ToString(),
                Name = fight.Name,
                Author = fight.Author,
                BossRef = fight.BossRef.ToString(),
                IsPrivate = fight.IsPrivate,
                UserName = fight.UserName,
                Secret = null,
                Data = ""
            });
        }

        [HttpGet("[action]")]
        [Authorize]
        public async Task<IActionResult> Fights()
        {
            var nameClaim = HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Sub);
            if (nameClaim == null)
                return Unauthorized();

            var data = await _dataContext.Fights
                .Where(s => s.UserName == nameClaim.Value)
                .Select(entity => new FightSearchResult()
                {
                    Id = entity.Identifier.ToString(),
                    Name = entity.Name,
                    Author = entity.Author
                }).ToArrayAsync();
            return Json(data);
        }

        [HttpPost("[action]")]
        [Authorize]
        public async Task<IActionResult> RemoveFights([FromBody] string[] ids)
        {
            var nameClaim = HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Sub);
            if (nameClaim == null)
                return Unauthorized();

            var data = _dataContext.Fights.Where(entity => ids.Contains(entity.Identifier.ToString()) && entity.UserName == nameClaim.Value);

            _dataContext.RemoveRange(data);
            await _dataContext.SaveChangesAsync();

            return Ok();
        }

        public class BossData
        {
            [JsonProperty("id")]
            public string Id { get; set; }
            [JsonProperty("name")]
            public string Name { get; set; }
            [JsonProperty("author")]
            public string Author { get; set; }
            [JsonProperty("userName")]
            public string UserName { get; set; }
            [JsonProperty("secret")]
            public string Secret { get; set; }
            [JsonProperty("data")]
            public string Data { get; set; }
            [JsonProperty("isPrivate")]
            public bool IsPrivate { get; set; }
        }

        public class FightData
        {
            [JsonProperty("id")]
            public string Id { get; set; }
            [JsonProperty("name")]
            public string Name { get; set; }
            [JsonProperty("author")]
            public string Author { get; set; }
            [JsonProperty("userName")]
            public string UserName { get; set; }
            [JsonProperty("secret")]
            public string Secret { get; set; }
            [JsonProperty("data")]
            public string Data { get; set; }
            [JsonProperty("isPrivate")]
            public bool IsPrivate { get; set; }
            [JsonProperty("bossRef")]
            public string BossRef { get; set; }
        }

        public class BossSearchResult
        {
            public string Id { get; set; }
            public string Name { get; set; }
            public string Author { get; set; }
        }

        public class FightSearchResult
        {
            public string Id { get; set; }
            public string Name { get; set; }
            public string Author { get; set; }
        }
    }
}
