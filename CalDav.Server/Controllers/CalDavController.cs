using CalDav.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Xml.Linq;
//http://greenbytes.de/tech/webdav/draft-dusseault-caldav-05.html

namespace CalDav.Server.Controllers {
	public class CalDavController : Controller {

		[Route("caldav/{*path}", "options")]
		public ActionResult Options(string name) {
			var xdoc = GetRequestXml();
			if (xdoc != null) {
				var request = xdoc.Root.Elements().FirstOrDefault();
				switch (request.Name.LocalName.ToLower()) {
					case "calendar-collection-set": return Options_CalendarCollectionSet();
				}
			}

			return new Result {
				Headers = new Dictionary<string, string> {
					{"Allow", "OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, COPY, MOVE, MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK, REPORT, KCALENDAR, ACL" },
					{"DAV", "1, 2, access-control, calendar-access"}
				}
			};
		}

		[Route("caldav/{*path}", "mkcalendar")]
		public ActionResult MakeCalendar(string path) {
			var repo = GetService<ICalendarRepository>();
			repo.CreateCalendar(path);
			return new Result { Status = System.Net.HttpStatusCode.Created };
		}

		[Route("caldav/{*path}", "get")]
		public ActionResult Get(string path) {
			return new Result();
		}

		[Route("caldav/{*path}", "put")]
		public ActionResult Put(string path, string filename) {
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByPath(path);
			var input = GetRequestCalendar();
			var e = input.Events.FirstOrDefault();
			e.LastModified = new DDay.iCal.iCalDateTime(DateTime.UtcNow);
			repo.Save(calendar, e);

			return new Result {
				Headers = new Dictionary<string, string> {
					{"Location",  Url.Action("Get", new { path = calendar.Path + "/" + e.UID + ".ics" })},
					{"ETag", e.Sequence + "-" + e.LastModified.ToString() }
				},
				Status = System.Net.HttpStatusCode.Created
			};
		}

		[Route("caldav/{*path}", "report")]
		public ActionResult Report(string path) {
			var xdoc = GetRequestXml();
			if (xdoc == null) return new Result();

			var request = xdoc.Root.Elements().FirstOrDefault();
			var filter = new Filter(request.Element(CalDav.Common.xCaldav.GetName("filter")));

			return new Result();
		}

		private ActionResult Options_CalendarCollectionSet() {
			var repo = GetService<ICalendarRepository>();
			var calendars = repo.List().ToArray();
			if (calendars.Length == 0)
				calendars = new[] { repo.CreateCalendar("me") };

			return new Result {
				Content = new XElement(CalDav.Common.xDAV.GetName("options-response"),
				 new XElement(CalDav.Common.xCaldav.GetName("calendar-collection-set"),
					 calendars.Select(calendar =>
						 new XElement(CalDav.Common.xDAV.GetName("href"),
							 new Uri(Request.Url, Url.Action("Report", new { path = calendar.Path }) + "/")
							 ))
				 )
			 )
			};
		}

		private List<IDisposable> _Disposables = new List<IDisposable>();
		private T GetService<T>() {
			var obj = System.Web.Mvc.DependencyResolver.Current.GetService<T>();
			if (obj != null && obj is IDisposable)
				_Disposables.Add(obj as IDisposable);
			return obj;
		}
		protected override void OnResultExecuted(ResultExecutedContext filterContext) {
			base.OnResultExecuted(filterContext);
			foreach (var disposable in _Disposables)
				if (disposable != null)
					try {
						disposable.Dispose();
					} catch (Exception) { }
		}

		private T Dependency<T>() where T : class {
			var name = typeof(T).Name;
			return HttpContext.Items[name] as T
				?? (T)(HttpContext.Items[name] = GetService<T>());
		}

		XDocument GetRequestXml() {
			if (!(Request.ContentType ?? string.Empty).ToLower().Contains("xml"))
				return null;
			using (var str = Request.GetBufferlessInputStream())
				return XDocument.Load(str);
		}

		DDay.iCal.IICalendar GetRequestCalendar() {
			if (!(Request.ContentType ?? string.Empty).ToLower().Contains("calendar"))
				return null;
			var serializer = new DDay.iCal.Serialization.iCalendar.iCalendarSerializer();
			using (var str = Request.GetBufferlessInputStream()) {
				var ical = serializer.Deserialize(str, Request.ContentEncoding ?? System.Text.Encoding.Default);
				return (ical as DDay.iCal.IICalendarCollection)[0];
			}
		}

		public Result AsResult(DDay.iCal.IEvent e) {
			var serializer = new DDay.iCal.Serialization.iCalendar.iCalendarSerializer();
			var ical = new DDay.iCal.iCalendar();
			ical.Events.Add(e);
			return new Result(ctx => serializer.Serialize(ical, ctx.HttpContext.Response.OutputStream, ctx.HttpContext.Response.ContentEncoding ?? System.Text.Encoding.Default));
		}


	}
}
