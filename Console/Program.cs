using CalDav;
using Shouldly;
using System;

namespace ConsoleApp {
	class Program {

		static void Main(string[] args) {
			var server = new CalDav.Client.Server("http://localhost:60399/caldav/");

			if (server.Supports("MKCALENDAR"))
				server.CreateCalendar("me");
			var sets = server.GetCalendars();
			sets.ShouldContain(x => x.Url.AbsolutePath.EndsWith("/caldav/me/"));

			var calendar = sets[0];
			var e = new Event {
				Description = "this is a description",
				Summary = "summary",
				Sequence = (int)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalMilliseconds,
			};
			calendar.Save(e);
			Console.WriteLine(e.Url);
		}

	}
}
