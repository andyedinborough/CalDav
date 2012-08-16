using System;
using System.Linq;
using System.Xml.Linq;

namespace ConsoleApp {
	public class Server {
		public Uri Url { get; set; }
		public Server(string url) : this(new Uri(url)) { }

		private string[] _Options;

		public Server(Uri url) {
			Url = url;
			_Options = GetOptions();
		}

		internal string[] GetOptions() {
			var result = Utilities.Request(Url, "options");
			var dav = result.Item3["DAV"];
			if (dav == null || !dav.Contains("calendar-access"))
				throw new Exception("This does not appear to be a valid CalDav server");
			return result.Item3["Allow"].Split(',').Select(x => x.Trim()).Distinct().ToArray();
		}

		public void CreateCalendar(string name) {
			var result = Utilities.Request(Url, "mkcalendar");
			if (result.Item1 != System.Net.HttpStatusCode.Created)
				throw new Exception("Unable to create calendar");
		}

		public Calendar[] GetCalendars() {
			var xcollectionset = Utilities.xCaldav.GetName("calendar-collection-set");
			var result = Utilities.Request(Url, "options", new XDocument(
					new XElement(Utilities.xDAV.GetName("options"),
						new XElement(xcollectionset)
						)
				));

			var xdoc = XDocument.Parse(result.Item2);
			var hrefs = xdoc.Descendants(xcollectionset).SelectMany(x => x.Descendants(Utilities.xDAV.GetName("href")));
			return hrefs.Select(x => new Calendar { Url = new Uri(Url, x.Value) }).ToArray();
		}

	}
}
