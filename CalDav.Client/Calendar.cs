using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Xml.Linq;

namespace CalDav.Client {
	public class Calendar {
		public Uri Url { get; set; }
		public NetworkCredential Credentials { get; set; }

		public CalendarCollection Search(CalDav.CalendarQuery query) {
			var result = Common.Request(Url, "REPORT", (XElement)query, Credentials, new Dictionary<string, string> {
				{ "Depth", "1" }
			});
			var xdoc = XDocument.Parse(result.Item2);
			var data = xdoc.Descendants(CalDav.Common.xCaldav.GetName("calendar-data"));
			var serializer = new Serializer();
			return new CalendarCollection(data.SelectMany(x => {
				using (var rdr = new System.IO.StringReader(x.Value)) {
					return serializer.Deserialize<CalendarCollection>(rdr);
				}
			}));
		}

		public void Save(Event e) {
			var result = Common.Request(new Uri(Url, "event.ics"), "PUT", (req, str) => {
				req.Headers[System.Net.HttpRequestHeader.IfNoneMatch] = "*";
				req.ContentType = "text/calendar";
				Common.Serialize(str, e, System.Text.Encoding.UTF8);
			}, Credentials);
			if (result.Item1 != System.Net.HttpStatusCode.Created)
				throw new Exception("Unable to save event.");
			e.Url = new Uri(Url, result.Item3[System.Net.HttpResponseHeader.Location]);
		}
	}
}
