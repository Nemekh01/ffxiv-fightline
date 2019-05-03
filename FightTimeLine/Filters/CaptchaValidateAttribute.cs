using System;
using System.Net.Http;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace FightTimeLine.Filters
{
    public class CaptchaValidateAttribute:ActionFilterAttribute
    {

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context.HttpContext.Request.Headers.ContainsKey("Captcha"))
            {
                var captcha = context.HttpContext.Request.Headers["Captcha"];
                IConfiguration configuration =  context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
                var configurationSection = configuration.GetSection("Captcha");
                HttpClient client = new HttpClient();
                var httpResponseMessage = client.PostAsync(configurationSection["Url"] + "?secret=" + configurationSection["Secret"] + "&response=" + captcha, new StringContent("", Encoding.UTF8, "application/json")).Result;
                var response = httpResponseMessage.Content.ReadAsStringAsync().Result;
                var deserializeObject = (JObject)JsonConvert.DeserializeObject(response);
                if (!deserializeObject["success"].Value<bool>())
                {
                    context.Result = new BadRequestResult();
                }
            }
            else
            {
                context.Result = new BadRequestResult();
            }
            
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            
        }
    }
}