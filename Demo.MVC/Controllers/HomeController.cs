using CalDav;
using CalDav.MVC.Models;
using CalDav.Server;
using System;
using System.Security.Principal;
using System.Web.Mvc;

namespace Demo.MVC.Controllers
{
    public class HomeController : CalDavController
    {
        public HomeController()
        {
            IPrincipal user = new GenericPrincipal(new GenericIdentity("User 1"), new[] { "student" });

            var e = new Event
            {
                Created = DateTime.Now,
                Start = DateTime.Now,
                End = DateTime.Now.AddDays(1),
                Description = "Test",
                Location = "sdfsdf"
            };


            ICalendarRepository repository = new CalendarRepository(user);
            var calendar = repository.CreateCalendar("me");
            //calendar.ID = "student-calendar";
            (calendar as CalendarInfo).AddItem(e);
            repository.Save(calendar, e);

            RegisterService(repository);

        }

        public ActionResult Ics(string path)
        {
            var file = @"C:\X\CalDAV\Demo.MVC\App_Data\Calendars\" + path.Replace("/", "\\");
            return File(file, "text/calendar");
        }
    }
}