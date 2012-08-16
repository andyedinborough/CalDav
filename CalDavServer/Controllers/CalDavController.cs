using CalDavServer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Xml.Linq;
//http://greenbytes.de/tech/webdav/draft-dusseault-caldav-05.html

namespace CalDavServer.Controllers {
	public class CalDavController : Controller {
		private static readonly XNamespace xDAV = XNamespace.Get("DAV");
		private static readonly XNamespace xCaldav = XNamespace.Get("urn:ietf:params:xml:ns:caldav");

		[Route("caldav/", "options")]
		public ActionResult Options(string name) {
			var xdoc = GetRequestXml();
			if (xdoc != null) {
				var request = xdoc.Root.Elements().FirstOrDefault();
				switch (request.Name.LocalName.ToLower()) {
					case "calendar-collection-set": return Options_CalendarCollectionSet();
				}
			}

			return Empty()
				.WithHeader("Allow", "OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, COPY, MOVE")
				.WithHeader("Allow", "MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK, REPORT")
				.WithHeader("Allow", "MKCALENDAR, ACL")
				.WithHeader("DAV", "1, 2, access-control, calendar-access");
		}

		[Route("caldav/", "mkcalendar")]
		public ActionResult MakeCalendar(string name) {
			var repo = GetService<ICalendarRepository>();
			repo.CreateCalendar(name);
			return AsResult(string.Empty).WithHeaders(System.Net.HttpStatusCode.Created);
		}

		[Route("caldav/{name}/event.ics", "get")]
		public ActionResult Get(string name, string filename) {
			return Empty();
		}

		[Route("caldav/{name}/event.ics", "put")]
		public ActionResult Put(string name, string filename) {
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByName(name);
			var input = GetRequestCalendar();
			var e = input.Events.FirstOrDefault();
			repo.Save(calendar, e);

			return Empty()
				.WithHeader("Location", Url.Action("GetEvent", new { name, uid = e.UID }))
				.WithHeader("ETag", e.Sequence + "-" + e.LastModified.ToString())
				.WithHeaders(System.Net.HttpStatusCode.Created);
		}

		[Route("caldav/{name}/event/{uid}.ics", "get")]
		public ActionResult GetEvent(string name, string uid) {
			var repo = GetService<ICalendarRepository>();
			var e = repo.GetEventByUID(uid);
			return AsResult(e);
		}

		[Route("caldav/{name}/", "report")]
		public ActionResult Report(string name) {
			var xdoc = GetRequestXml();
			if (xdoc == null) return Empty();

			var request = xdoc.Root.Elements().FirstOrDefault();
			var filter = request.Element(xCaldav.GetName("filter"));


			return Empty();
		}

		private ActionResult Options_CalendarCollectionSet() {
			var repo = GetService<ICalendarRepository>();
			var calendars = repo.List().ToArray();
			if (calendars.Length == 0)
				calendars = new[] { repo.CreateCalendar("me") };

			return AsResult(new XElement(xDAV.GetName("options-response"),
					new XElement(xCaldav.GetName("calendar-collection-set"),
						calendars.Select(calendar => new XElement(xDAV.GetName("href"), new Uri(Request.Url, Url.Action("Report", new { name = calendar.Name }))))
					)
				));
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

		public LambdaResult AsResult(DDay.iCal.IEvent e) {
			var serializer = new DDay.iCal.Serialization.iCalendar.iCalendarSerializer();
			var ical = new DDay.iCal.iCalendar();
			ical.Events.Add(e);
			return new LambdaResult(ctx => serializer.Serialize(ical, ctx.HttpContext.Response.OutputStream, ctx.HttpContext.Response.ContentEncoding ?? System.Text.Encoding.Default));
		}

		public LambdaResult AsResult(XDocument xdoc) {
			return AsResult(xdoc.Root);
		}

		public LambdaResult AsResult(XElement xdoc) {
			return new LambdaResult(ctx => xdoc.Save(ctx.HttpContext.Response.OutputStream));
		}

		public LambdaResult AsResult(string content) {
			return new LambdaResult(ctx => ctx.HttpContext.Response.Write(content));
		}

		public LambdaResult Empty() {
			return AsResult(string.Empty);
		}
	}
}
