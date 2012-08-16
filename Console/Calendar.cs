using System;

namespace ConsoleApp {
	public class Calendar {
		public Uri Url { get; set; }

		public void Save(DDay.iCal.IEvent e) {
			var result = Utilities.Request(new Uri(Url, "event.ics"), "PUT", (req, str) => {
				req.Headers[System.Net.HttpRequestHeader.IfNoneMatch] = "*";
				req.ContentType = "text/calendar";
				Utilities.Serialize(str, e, System.Text.Encoding.UTF8);
			});
			if (result.Item1 != System.Net.HttpStatusCode.Created)
				throw new Exception("Unable to save event.");
			e.Url = new Uri(Url, result.Item3[System.Net.HttpResponseHeader.Location]);
		}
	}
}
