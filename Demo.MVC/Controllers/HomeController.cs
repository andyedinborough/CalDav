using CalDav.MVC.Models;
using CalDav.Server.Controllers;
using System;
using System.Collections.Generic;
using System.Security.Principal;
using System.Web.Mvc;
using CalDav.Server.Models;

namespace Demo.MVC.Controllers
{
    public class HomeController : CalDavController
    {
        public HomeController()
        {
            //var obj = System.Web.Mvc.DependencyResolver.Current.GetService<T>();
            //CalendarRepository


            //System.Web.Mvc.DependencyResolver.SetResolver(new R());
            
            IPrincipal user = new GenericPrincipal(new GenericIdentity("User 1"), new[] { "student" });
            ICalendarRepository repository = new CalendarRepository(user);
            RegisterService(repository);

        }
    }
}