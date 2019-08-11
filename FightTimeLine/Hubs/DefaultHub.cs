using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace FightTimeLine.Hubs
{
     public class DefaultHub : Hub
     {
          public async Task Command(string code, object data)
          {
               await Clients.OthersInGroup(code).SendAsync("command", data, new User()
               {
                    id = Context.ConnectionId,
                    name = Context.Items["username"]?.ToString(),
                    owner = Convert.ToBoolean(Context.Items["owner"] ?? false)
               });
          }

          public async Task<string> StartSession(string username)
          {
               var group = Guid.NewGuid().ToString();
               Context.Items.Add("username", username);
               Context.Items.Add("owner", true);
               await Groups.AddToGroupAsync(Context.ConnectionId, group);
               return group;
          }

          public async Task Disconnect(string code)
          {
               await Clients.OthersInGroup(code).SendAsync("disconnected", new User() { id = Context.ConnectionId, name = Context.Items["username"]?.ToString(), owner = Convert.ToBoolean(Context.Items["owner"] ?? false) });
               await Groups.RemoveFromGroupAsync(Context.ConnectionId, code);
          }

          public async Task Connect(string code, string username)
          {
               this.Context.Items.Add("username", username);
               await Groups.AddToGroupAsync(Context.ConnectionId, code);
               await Clients.OthersInGroup(code).SendAsync("connected", new User() { id = Context.ConnectionId, name = username, owner = false });
               await Clients.OthersInGroup(code).SendAsync("sync");
          }

          public async Task SyncUsers(string code, User[] users)
          {
               await Clients.OthersInGroup(code).SendAsync("syncUsers", users);
          }

          public async Task Sync(string code, string data)
          {
               await Clients.OthersInGroup(code).SendAsync("datasync", data);
          }
     }

     public class User
     {
          public string id { get; set; }
          public string name { get; set; }
          public bool owner { get; set; }
     }
}