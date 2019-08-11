// // <copyright file="HubUsersStorage.cs" company="ZoralLabs">
// //   Copyright (c) 2018-2019 Zoral Limited. All Rights Reserved.
// //   This software licensed under exclusive legal right of the copyright holder
// //   with the intent that the licensee is given the right to use the software
// //   only under certain conditions, and restricted from other uses, such as
// //   sharing, redistribution, or reverse engineering.
// // </copyright>

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FightTimeLine.Contracts;
using FightTimeLine.DataLayer;
using Microsoft.EntityFrameworkCore;

namespace FightTimeLine.Hubs
{
     public class UserContainer
     {
          public string Name { get; set; }
          public string Id { get; set; }
          public Guid Fight { get; set; }
     }

     public class SqlServerHubUsersStorage : IHubUsersStorage
     {
          private readonly FightTimelineDataContext _dataContext;

          public SqlServerHubUsersStorage(FightTimelineDataContext dataContext)
          {
               _dataContext = dataContext ?? throw new ArgumentNullException(nameof(dataContext));
          }

          public async Task AddUserAsync(UserContainer user)
          {
               await _dataContext.Sessions.AddAsync(new SessionEntity()
               {
                    Fight = user.Fight,
                    UserId = user.Id,
                    UserName = user.Name
               });
               await _dataContext.SaveChangesAsync();
          }

          public async Task RemoveUserAsync(Guid fight, string id)
          {
               var arrayAsync = await _dataContext.Sessions.Where(entity => entity.Fight == fight && entity.UserId == id).ToArrayAsync();
               _dataContext.Sessions.RemoveRange(arrayAsync);
               await _dataContext.SaveChangesAsync();
          }

          public async Task<IEnumerable<UserContainer>> GetUsersForFightAsync(Guid fight)
          {
               var entities = await _dataContext.Sessions.Where(entity => entity.Fight == fight).ToArrayAsync();
               return entities.Select(entity => new UserContainer()
               {
                    Fight = entity.Fight,
                    Id = entity.UserId,
                    Name = entity.UserName
               }).ToArray();
          }
     }


     public class InMemoryHubUsersStorage : IHubUsersStorage
     {
          readonly List<UserContainer> _list = new List<UserContainer>();
          public async Task AddUserAsync(UserContainer user)
          {
               lock (_list)
               {
                    _list.Add(user);
               }
          }

          public async Task RemoveUserAsync(Guid fight, string id)
          {
               lock (_list)
               {
                    _list.RemoveAll(container => container.Fight == fight && container.Id == id);
               }
          }

          public async Task<IEnumerable<UserContainer>> GetUsersForFightAsync(Guid fight)
          {
               lock (_list)
               {
                    return _list.Where(container => container.Fight == fight).ToArray();
               }
          }
     }
}