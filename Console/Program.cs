using Shouldly;
using System;

namespace ConsoleApp {
	class Program {

		static void Main(string[] args) {
			var server = new Server("http://localhost:60399/caldav");
			server.GetOptions();

			server.CreateCalendar("me");
			var sets = server.GetCalendars();
			sets.ShouldContain(x => x.Url.AbsolutePath.EndsWith("/caldav/me/"));

			var calendar = sets[0];
			var e = new DDay.iCal.Event {
				Description = "this is a description",
				Summary = "summary",
				Sequence = (int)(DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalMilliseconds,
			};
			calendar.Save(e);
			Console.WriteLine(e.Url);
		}

	}
}
