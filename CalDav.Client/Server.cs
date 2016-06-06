using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace CalDav.Client {
	public class Server {
        private Common Common;
		public Uri Url { get; set; }
		public System.Net.NetworkCredential Credentials { get; set; }
		public Server(string url, CalCli.API.IConnection connection, string username = null, string password = null)
			: this(new Uri(url), connection, username, password) { }

        private HashSet<string> _Options;
        private string v;
        private CalCli.API.IConnection connection;

        public Server(Uri url, CalCli.API.IConnection connection, string username = null, string password = null) {
            Common = new Common(connection);
			Url = url;
			if (username != null && password != null) {
				Credentials = new System.Net.NetworkCredential(username, password);
			}
			_Options = GetOptions();
		}
        

        public HashSet<string> Options {
			get {
				if (_Options == null)
					lock (this)
						if (_Options == null)
							_Options = GetOptions();
				return _Options;
			}
		}

		private HashSet<string> GetOptions() {
			var result = Common.Request(Url, "options", credentials: Credentials);
			if (result.Item3["WWW-Authenticate"] != null)
				throw new Exception("Authentication is required");
			var dav = result.Item3["DAV"];
			if (dav == null || !dav.Contains("calendar-access"))
				throw new Exception("This does not appear to be a valid CalDav server");
			return new HashSet<string>((result.Item3["Allow"] ?? string.Empty).ToUpper().Split(',').Select(x => x.Trim()).Distinct(), StringComparer.OrdinalIgnoreCase);
		}

		public void CreateCalendar(string name) {
			if (!Options.Contains("MKCALENDAR"))
				throw new Exception("This server does not support creating calendars");
			var result = Common.Request(new Uri(Url, name), "mkcalendar", credentials: Credentials);
			if (result.Item1 != System.Net.HttpStatusCode.Created)
				throw new Exception("Unable to create calendar");
		}

		public Calendar[] GetCalendars() {
			var xcollectionset = CalDav.Common.xCalDav.GetName("calendar-collection-set");
			var result = Common.Request(Url, "propfind", new XDocument(
					new XElement(CalDav.Common.xDav.GetName("options"),
						new XElement(xcollectionset)
						)
				), Credentials, new System.Collections.Generic.Dictionary<string, object> { { "Depth", 0 } });

			if (string.IsNullOrEmpty(result.Item2))
				return new[]{
					 new Calendar(Common) { Url =  Url, Credentials = Credentials }
				};

			var xdoc = XDocument.Parse(result.Item2);
            //var hrefs = xdoc.Descendants(xcollectionset).SelectMany(x => x.Descendants(CalDav.Common.xDav.GetName("href")));
            var hrefs = xdoc.Descendants(CalDav.Common.xDav.GetName("href"));
			return hrefs.Select(x => new Calendar (Common) { Url = new Uri(Url, x.Value), Credentials = Credentials }).ToArray();
		}


		public bool Supports(string option) {
			return Options.Contains(option);
		}
	}
}
