using CalDav;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using System;

namespace Tests
{
    [TestClass]
    public class IRLTests
    {
        [TestMethod]
        public void ParseFeed()
        {
            var calendar = new CalDav.Calendar();
            var serializer = new Serializer();
            var req = System.Net.WebRequest.Create("http://www.nasa.gov/templateimages/redesign/calendar/iCal/nasa_calendar.ics");
            
            using (var res = req.GetResponse())
            {
                using (var str = res.GetResponseStream())
                {
                    using (var rdr = new System.IO.StreamReader(str))
                    {
                        calendar.Deserialize(rdr, serializer);
                    }
                }
            }

            calendar.Events.Count.ShouldBeGreaterThan(0);
        }

        [TestMethod]
        public void ParseICal()
        {
            //http://blogs.nologin.es/rickyepoderi/index.php?/archives/14-Introducing-CalDAV-Part-I.html
            //http://blogs.nologin.es/rickyepoderi/index.php?/archives/15-Introducing-CalDAV-Part-II.html

            var server = new CalDav.Client.Server("https://www.google.com/calendar/dav/andy.edinborough@gmail.com/events/", "andy.edinborough@gmail.com", "Gboey6Emo!");
            var calendars = server.GetCalendars();
            calendars.ShouldNotBeEmpty();

            var calendar = calendars[0];
            var events = calendar.Search(CalendarQuery.SearchEvents(new DateTime(2012, 8, 1), new DateTime(2012, 8, 31))).ToArray();
            events.Length.ShouldBeGreaterThan(0);

        }
    }
}
