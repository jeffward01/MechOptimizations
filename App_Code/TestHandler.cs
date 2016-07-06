using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace UMPG.USLWeb.App_Code
{
    public class TestHandler : IHttpHandler
    {
        public TestHandler()
        {
        }

        public void ProcessRequest(HttpContext context)
        {
            //HttpRequest Request = context.Request;
            HttpResponse Response = context.Response;
            // This handler is called whenever a file ending 
            // in .sample is requested. A file with that extension
            // does not need to exist.
            //HttpContext.Current.Response.Cookies.Add(cookie);

            //Response.Cookies.Add(new HttpCookie("UserName", GetCurrentUserWindowsLogin()));
            string contextUserIdentityName = context.User.Identity.Name.ToString();

            string systemEnvirontmentUserName = System.Environment.UserName.ToString();

            Response.Write("<html>");
            Response.Write("<body>");
            Response.Write(String.Format("<h3>GetCurrent: {0}<br>System Environment: {1}<br>Context User Identity Name: {2}</h1>", GetCurrentUserWindowsLogin(), systemEnvirontmentUserName, contextUserIdentityName));
            Response.Write("</body>");
            Response.Write("</html>");


        }
        public bool IsReusable
        {
            // To enable pooling, return true here.
            // This keeps the handler in memory.
            get { return false; }
        }



        private string GetCurrentUserWindowsLogin()
        {
            var userName = string.Empty;
            try
            {

                userName = System.Security.Principal.WindowsIdentity.GetCurrent().Name.ToString();
            }
            catch (Exception e)
            {
                userName = e.Message.ToString();
            }
            return userName;

        } //end GetCurrentUserWindowsLogin
    }
}