using CalDav;
using Shouldly;
using System;

namespace ConsoleApp {
	class Program {
		//http://www.phpkode.com/source/p/eyeos/eyeos-2.5/eyeos/system/Frameworks/Calendar/calDavLib/caldav-client.php
		//http://www.webdav.org/specs/rfc4791.html
		//https://bugzilla.mozilla.org/show_bug.cgi?id=702570
		static void Main(string[] args) {
			var server = new CalDav.Client.Server("http://localhost:60399/caldav/", new CalCli.Connections.GoogleConnection(" "));

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
