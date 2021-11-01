﻿using System;
using System.Net;
using System.Xml.Linq;
using CalCli.API;

namespace CalDav.Client {
	public class Common {
        private IConnection connection;

        public Common(IConnection connection)
        {
            this.connection = connection;
        }

        public Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method, XDocument content, NetworkCredential credentials = null, System.Collections.Generic.Dictionary<string, object> headers = null) {
			return Request(url, method, content.Root, credentials, headers);
		}
		public Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method, XElement content, NetworkCredential credentials = null, System.Collections.Generic.Dictionary<string, object> headers = null) {
			return Request(url, method, (req, str) => {
				req.ContentType = "text/xml";
                var xml = content.ToString();
                using (var wrtr = new System.IO.StreamWriter(str))
					wrtr.Write(xml);
			}, credentials, headers);
		}

		public Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method, string contentType, string content, NetworkCredential credentials = null, System.Collections.Generic.Dictionary<string, object> headers = null) {
			return Request(url, method, (req, str) => {
				req.ContentType = contentType;
				using (var wrtr = new System.IO.StreamWriter(str))
					wrtr.Write(content);
			}, credentials, headers);
		}

		public Tuple<System.Net.HttpStatusCode, string, System.Net.WebHeaderCollection> Request(Uri url, string method = "GET", Action<System.Net.HttpWebRequest, System.IO.Stream> content = null, NetworkCredential credentials = null, System.Collections.Generic.Dictionary<string, object> headers = null) {
			var req = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(url);
            req = (System.Net.HttpWebRequest)connection.Authorize(req);
			req.Method = method.ToUpper();

			//Dear .NET, please don't try to do things for me.  kthxbai
			System.Net.ServicePointManager.Expect100Continue = false;

			if (headers != null)
				foreach (var header in headers) {
					var value = Convert.ToString(header.Value);
					if (header.Key.Is("User-Agent"))
						req.UserAgent = value;
					else req.Headers[header.Key] = value;
				}

            //if (credentials != null) {
            //	//req.Credentials = credentials;
            //	var b64 = credentials.UserName + ":" + credentials.Password;
            //	b64 = System.Convert.ToBase64String(System.Text.Encoding.Default.GetBytes(b64));
            //	req.Headers[HttpRequestHeader.Authorization] = "Basic " + b64;
            //}
            connection.Authorize(req);
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

		private System.Net.HttpWebResponse GetResponse(System.Net.HttpWebRequest req) {
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
            //System.IO.StreamWriter sr = new System.IO.StreamWriter(stream);
            //sr.WriteLine("BEGIN: VCALENDAR");
            //sr.WriteLine("VERSION:2.0");
            //sr.WriteLine("PRODID: CalCli");
            //sr.WriteLine("BEGIN:VEVENT");
            //var enumer = ical.Events.GetEnumerator();
            //enumer.MoveNext();
            //sr.WriteLine("UID:"+enumer.Current.UID);
            //sr.WriteLine("DTSTAMP:20060712T182145Z");
            //sr.WriteLine("DTSTART:20060714T170000Z");
            //sr.WriteLine("DTEND:20060715T040000Z");
            //sr.WriteLine("SUMMARY:Bastille Day Party");
            //sr.WriteLine("END:VEVENT");
            //sr.WriteLine("END:VCALENDAR");
            //return 
			var serializer = new CalDav.Serializer();
			serializer.Serialize(stream, ical, encoding);
		}
	}
}
