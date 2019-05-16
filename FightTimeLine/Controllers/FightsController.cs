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

          private string CurrentUserName
          {
               get
               {
                    return HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Sub)
                         ?.Value;
               }
          }

          public DataController(FightTimelineDataContext dataContext)
          {
               _dataContext = dataContext ?? throw new ArgumentNullException(nameof(dataContext));
          }

          [HttpGet("[action]/{reference}/{value?}")]
          public async Task<IEnumerable<BossSearchResult>> Bosses(long reference, string value, [FromQuery]bool privateOnly)
          {
               var name = CurrentUserName;

               return await _dataContext.Bosses
                    .Where(s => (string.IsNullOrEmpty(value) || s.Name.IndexOf(value, StringComparison.OrdinalIgnoreCase)>=0) && s.Reference == reference && (!s.IsPrivate && !privateOnly || s.IsPrivate && s.UserName == name))
                    .Select(s => new BossSearchResult()
                    {
                         Id = s.Identifier.ToString(),
                         Name = s.Name,
                         Owner = s.UserName,
                         CanRemove = !string.IsNullOrWhiteSpace(name) && string.Equals(name, s.UserName,StringComparison.OrdinalIgnoreCase),
                         CreateDate = s.CreateDate.GetValueOrDefault(),
                         ModifiedDate = s.ModifiedDate.GetValueOrDefault()
                    }).ToArrayAsync();
          }

          [HttpGet("[action]/{id?}")]
          public async Task<IActionResult> Boss(string id)
          {
               if (!Guid.TryParse(id, out var guid)) guid = Guid.Empty;

               var data = await _dataContext.Bosses.FirstOrDefaultAsync(entity => entity.Identifier == guid);
               if (data == null) return StatusCode(404);

               var name = CurrentUserName;

               if (data.IsPrivate && data.UserName != name)
                    return StatusCode(403);

               return Json(new BossData()
               {
                    Id = data.Identifier.ToString(),
                    Name = data.Name,
                    UserName = name,
                    Data = data.Data,
                    Reference = data.Reference ?? 0,
                    IsPrivate = data.IsPrivate,
               });
          }

          [HttpPost("[action]")]
          public async Task<IActionResult> SaveBoss([FromBody]BossData request)
          {
               var nameClaim = CurrentUserName;
               if (nameClaim == null)
                    return Unauthorized();

               if (!Guid.TryParse(request.Id, out var guid)) guid = Guid.Empty;
               var boss = await _dataContext.Bosses.FirstOrDefaultAsync(entity => entity.Identifier == guid);
               if (boss != null)
               {
                    if (boss.UserName != nameClaim)
                         return Unauthorized();
                    boss.Data = request.Data;
                    boss.IsPrivate = request.IsPrivate;
               }
               else
               {
                    boss = new BossEntity()
                    {
                         Identifier = Guid.NewGuid(),
                         Name = request.Name,
                         UserName = request.UserName,
                         IsPrivate = request.IsPrivate,
                         Data = request.Data,
                         Reference = request.Reference,
                         CreateDate = DateTimeOffset.UtcNow
                    };
                    _dataContext.Bosses.Add(boss);
               }
               boss.ModifiedDate = DateTimeOffset.UtcNow;

               await _dataContext.SaveChangesAsync();

               return Json(new BossData()
               {
                    Id = boss.Identifier.ToString(),
                    Name = boss.Name,
                    UserName = boss.UserName,
                    Data = "",
                    IsPrivate = boss.IsPrivate,
                    Reference = boss.Reference.GetValueOrDefault(),
                    CreateDate = boss.CreateDate.GetValueOrDefault(),
                    ModifiedDate = boss.ModifiedDate.GetValueOrDefault()
               });
          }

          [HttpPost("[action]")]
          public async Task<IActionResult> RemoveBosses([FromBody] string[] ids)
          {
               var nameClaim = CurrentUserName;
               if (nameClaim == null)
                    return Unauthorized();

               var data = _dataContext.Bosses.Where(entity => ids.Contains(entity.Identifier.ToString()) && entity.UserName == nameClaim);

               _dataContext.RemoveRange(data);
               await _dataContext.SaveChangesAsync();

               return Ok();
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
                    UserName = data.UserName,
                    Data = data.Data
               });
          }

          [HttpPost("[action]")]
          [Authorize]
          public async Task<IActionResult> SaveFight([FromBody]FightData request)
          {
              var nameClaim = CurrentUserName;
               if (nameClaim == null)
                    return Unauthorized();


               if (!Guid.TryParse(request.Id, out var guid)) guid = Guid.Empty;
               var fight = await _dataContext.Fights.FirstOrDefaultAsync(entity => entity.Identifier == guid);
               if (fight != null)
               {
                    if (fight.UserName.Trim() != nameClaim) return Unauthorized();

                    fight.Name = request.Name;
                    fight.Data = request.Data;
               }
               else
               {
                    fight = new FightEntity()
                    {
                         Identifier = Guid.NewGuid(),
                         Name = request.Name,
                         UserName = nameClaim,
                         Data = request.Data
                    };
                    _dataContext.Fights.Add(fight);
               }

               await _dataContext.SaveChangesAsync();

               return Json(new FightData
               {
                    Id = fight.Identifier.ToString(),
                    Name = fight.Name,
                    UserName = fight.UserName,
                    Data = ""
               });
          }

          [HttpGet("[action]")]
          [Authorize]
          public async Task<IActionResult> Fights()
          {
               var nameClaim = CurrentUserName;
               if (nameClaim == null)
                    return Unauthorized();

               var data = await _dataContext.Fights
                   .Where(s => s.UserName == nameClaim)
                   .Select(entity => new FightSearchResult()
                   {
                        Id = entity.Identifier.ToString(),
                        Name = entity.Name,
                   }).ToArrayAsync();
               return Json(data);
          }

          [HttpPost("[action]")]
          [Authorize]
          public async Task<IActionResult> RemoveFights([FromBody] string[] ids)
          {
               var nameClaim = HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Sub)?.Value;
               if (nameClaim == null)
                    return Unauthorized();

               var data = _dataContext.Fights.Where(entity => ids.Contains(entity.Identifier.ToString()) && entity.UserName == nameClaim);

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
               [JsonProperty("userName")]
               public string UserName { get; set; }
               [JsonProperty("data")]
               public string Data { get; set; }
               [JsonProperty("isPrivate")]
               public bool IsPrivate { get; set; }
               [JsonProperty("ref")]
               public long Reference { get; set; }
               [JsonProperty("createDate")]
               public DateTimeOffset CreateDate { get; set; }
               [JsonProperty("modifiedDate")]
               public DateTimeOffset ModifiedDate { get; set; }
          }

          public class FightData
          {
               [JsonProperty("id")]
               public string Id { get; set; }
               [JsonProperty("name")]
               public string Name { get; set; }
               [JsonProperty("userName")]
               public string UserName { get; set; }
               [JsonProperty("data")]
               public string Data { get; set; }
          }

          public class BossSearchResult
          {
               public string Id { get; set; }
               public string Name { get; set; }
               public string Owner { get; set; }
               public bool CanRemove { get; set; }
               [JsonProperty("createDate")]
               public DateTimeOffset CreateDate { get; set; }
               [JsonProperty("modifiedDate")]
               public DateTimeOffset ModifiedDate { get; set; }
          }

          public class FightSearchResult
          {
               public string Id { get; set; }
               public string Name { get; set; }
          }
     }
}
