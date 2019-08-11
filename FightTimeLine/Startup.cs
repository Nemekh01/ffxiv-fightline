using System.Text;
using FightTimeLine.Contracts;
using FightTimeLine.DataLayer;
using FightTimeLine.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace FightTimeLine
{
     public class Startup
     {
          public Startup(IConfiguration configuration)
          {
               Configuration = configuration;
          }

          public IConfiguration Configuration { get; }

          // This method gets called by the runtime. Use this method to add services to the container.
          public void ConfigureServices(IServiceCollection services)
          {
               services.AddOptions();
               services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

               services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                   .AddJwtBearer(options =>
                   {
                        options.TokenValidationParameters = new TokenValidationParameters()
                        {
                             ValidateIssuer = false,
                             ValidateAudience = false,
                             ValidateLifetime = false,
                             ValidateIssuerSigningKey = true,
                             IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
                        };
                   });

               services.AddScoped<IHubUsersStorage, SqlServerHubUsersStorage>();

               services.AddMemoryCache();

               services.AddEntityFrameworkSqlServer();

               services.AddSignalR();

               services.AddCors(options =>
               {
                    options.AddPolicy("CorsPolicy", cb =>
                 {
                      cb
                       .AllowAnyMethod()
                       .AllowAnyHeader()
                       .AllowAnyOrigin();
                 });
               });

               
               services.AddDbContext<FightTimelineDataContext>(builder =>
                   builder.UseSqlServer(Configuration.GetConnectionString("Default")));

               // In production, the Angular files will be served from this directory
               services.AddSpaStaticFiles(configuration =>
               {
                    configuration.RootPath = "ClientApp/dist";
               });
          }

          // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
          public void Configure(IApplicationBuilder app, IHostingEnvironment env)
          {
               app.SeedData();

               if (env.IsDevelopment())
               {
                    app.UseDeveloperExceptionPage();
               }
               else
               {
                    app.UseExceptionHandler("/Error");
                    app.UseHsts();
                    app.UseHttpsRedirection();
               }

               app.UseCors("CorsPolicy");

               app.UseAuthentication();

               app.UseSignalR(builder =>
               {
                    builder.MapHub<DefaultHub>("/hub",
                         options => { options.ApplicationMaxBufferSize = 4 * 1024 * 1024; });

                    builder.MapHub<FightHub>("/fightHub",
                         options => { options.ApplicationMaxBufferSize = 4 * 1024 * 1024; });
               });

               
               app.UseStaticFiles();
               app.UseSpaStaticFiles();

               app.UseMvc(routes =>
               {
                    routes.MapRoute(
                     name: "default",
                     template: "{controller}/{action=Index}/{id?}");
                    routes.MapRoute(
                     name: "fightsApi",
                     template: "api/{controller=Fights}/{action=Search}");
               });

               app.UseSpa(spa =>
               {
                    // To learn more about options for serving an Angular SPA from ASP.NET Core,
                    // see https://go.microsoft.com/fwlink/?linkid=864501

                    spa.Options.SourcePath = "ClientApp";

                    if (env.IsDevelopment())
                    {
                         spa.UseAngularCliServer(npmScript: "start");
                    }
               });
          }
     }

     public static class DataSeeder
     {
          public static void SeedData(this IApplicationBuilder app)
          {
               using (var scope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
               {
                    using (var context = scope.ServiceProvider.GetService<FightTimelineDataContext>())
                         if (!context.Database.EnsureCreated())
                              context.Database.Migrate();
               }


          }
     }
}
