using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Xml.Linq;

namespace CalDav.Client {
	public class Calendar {
		public Uri Url { get; set; }
		public NetworkCredential Credentials { get; set; }

		public IEnumerable<Event> Search(CalDav.CalendarQuery query) {
			var result = Common.Request(Url, "REPORT", (XElement)query, Credentials, new Dictionary<string, string> {
				{ "Depth", "1" }
			});
			var xdoc = XDocument.Parse(result.Item2);
			var data = xdoc.Descendants(CalDav.Common.xCaldav.GetName("calendar-data"));
			return data.SelectMany(x => {
				using (var rdr = new System.IO.StringReader(x.Value)) {
					var calendar = new CalDav.CalendarCollection();
					calendar.Deserialize(rdr);
					return calendar.SelectMany(c => c.Events);
				}
			})
			.ToArray();
		}

		public void Save(DDay.iCal.IEvent e) {
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
