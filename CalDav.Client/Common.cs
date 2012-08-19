using System;
using System.Net;
using System.Xml.Linq;

namespace CalDav.Client {
	internal static class Common {

		public static Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method, XDocument content, NetworkCredential credentials = null, System.Collections.Generic.Dictionary<string, string> headers = null) {
			return Request(url, method, content.Root, credentials, headers);
		}
		public static Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method, XElement content, NetworkCredential credentials = null, System.Collections.Generic.Dictionary<string, string> headers = null) {
			return Request(url, method, (req, str) => {
				req.ContentType = "text/xml";
				var xml = content.ToString();
				using (var wrtr = new System.IO.StreamWriter(str))
					wrtr.Write(xml);
			}, credentials, headers);
		}

		public static Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method, string contentType, string content, NetworkCredential credentials = null, System.Collections.Generic.Dictionary<string, string> headers = null) {
			return Request(url, method, (req, str) => {
				req.ContentType = contentType;
				using (var wrtr = new System.IO.StreamWriter(str))
					wrtr.Write(content);
			}, credentials, headers);
		}

		public static Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method = "GET", Action<System.Net.HttpWebRequest, System.IO.Stream> content = null, NetworkCredential credentials = null, System.Collections.Generic.Dictionary<string, string> headers = null) {
			var req = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(url);
			req.Method = method.ToUpper();
			if (credentials != null)
				req.Credentials = credentials;

			if (headers != null)
				foreach (var header in headers) {
					if (header.Key.Is("User-Agent"))
						req.UserAgent = header.Value;
					else req.Headers[header.Key] = header.Value;
				}

			using (var stream = req.GetRequestStream()) {
				if (content != null) {
					content(req, stream);
				}

				using (var res = GetResponse(req))
				using (var str = res.GetResponseStream())
				using (var rdr = new System.IO.StreamReader(str)) {
					return Tuple.Create(res.StatusCode, rdr.ReadToEnd(), res.Headers);
				}
			}
		}

		private static System.Net.HttpWebResponse GetResponse(System.Net.HttpWebRequest req) {
			try {
				return (System.Net.HttpWebResponse)req.GetResponse();
			} catch (System.Net.WebException wex) {
				return (System.Net.HttpWebResponse)wex.Response;
			}
		}

		public static void Serialize(System.IO.Stream stream, Event e, System.Text.Encoding encoding = null) {
			var ical = new CalDav.Calendar();
			ical.Events.Add(e);
			Serialize(stream, ical, encoding);
		}

		public static void Serialize(System.IO.Stream stream, CalDav.Calendar ical, System.Text.Encoding encoding = null) {
			var serializer = new CalDav.Serializer();
			serializer.Serialize(stream, ical, encoding);
		}
	}
}
