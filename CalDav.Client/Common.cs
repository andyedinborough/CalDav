using DDay.iCal;
using DDay.iCal.Serialization.iCalendar;
using System;
using System.Xml.Linq;

namespace CalDav.Client {
	internal static class Common {

		public static Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method, XDocument content) {
			return Request(url, method, (req, str) => {
				req.ContentType = "text/xml";
				content.Save(str);
			});
		}

		public static Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method, string content) {
			return Request(url, method, (req, str) => {
				using (var wrtr = new System.IO.StreamWriter(str))
					wrtr.Write(content);
			});
		}

		public static Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method = "GET", Action<System.Net.HttpWebRequest, System.IO.Stream> content = null) {
			var req = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(url);
			req.Method = method.ToUpper();

			if (content != null) {
				using (var str = req.GetRequestStream())
					content(req, str);
			}

			using (var res = GetResponse(req))
			using (var str = res.GetResponseStream())
			using (var rdr = new System.IO.StreamReader(str)) {
				return Tuple.Create(res.StatusCode, rdr.ReadToEnd(), res.Headers);
			}
		}

		private static System.Net.HttpWebResponse GetResponse(System.Net.HttpWebRequest req) {
			try {
				return (System.Net.HttpWebResponse)req.GetResponse();
			} catch (System.Net.WebException wex) {
				return (System.Net.HttpWebResponse)wex.Response;
			}
		}

		public static void Serialize(System.IO.Stream stream, DDay.iCal.IEvent e, System.Text.Encoding encoding = null) {
			var ical = new iCalendar();
			ical.Events.Add(e);
			Serialize(stream, ical, encoding);
		}

		public static void Serialize(System.IO.Stream stream, DDay.iCal.iCalendar ical, System.Text.Encoding encoding = null) {
			var serializer = new iCalendarSerializer(ical);
			serializer.Serialize(ical, stream, encoding ?? System.Text.Encoding.Default);
		}
	}
}
