using CalDav.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Xml.Linq;
//http://greenbytes.de/tech/webdav/draft-dusseault-caldav-05.html

namespace CalDav.Server.Controllers {
	public class CalDavController : Controller {
		const string BASE = "caldav";
		const string ROUTE = "caldav/{*path}";

		[Route(ROUTE, "options")]
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

		[Route(ROUTE, "propfind")]
		public ActionResult PropFind(string path) {
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByPath(path);
			var xdoc = GetRequestXml();
			var props = xdoc.Descendants(CalDav.Common.xDAV.GetName("prop")).FirstOrDefault().Elements();


			var allprop = props.Elements(Common.xDAV.GetName("allprops")).Any();

			var resourceTypeName = Common.xDAV.GetName("resourcetype");
			var resourceType = !allprop && !props.Any(x => x.Name == resourceTypeName) ? null :
				Common.xDAV.GetElement("resourcetype", Common.xDAV.GetElement("collection"), Common.xCaldav.GetElement("calendar"));

			var ownerName = Common.xDAV.GetName("owner");
			var owner = !allprop && !props.Any(x => x.Name == ownerName) ? null :
				Common.xDAV.GetElement("owner", Common.xDAV.GetElement("href", Url.Action("PropFind", new { path = calendar.Path })));

			var supportedComponentsName = Common.xCaldav.GetName("supported-calendar-component-set");
			var supportedComponents = !allprop && !props.Any(x => x.Name == supportedComponentsName) ? null :
				new[]{
					Common.xCaldav.GetElement("comp", new XAttribute("name", "VEVENT")),
					Common.xCaldav.GetElement("comp", new XAttribute("name", "VTODO"))
				};

			var supportedProperties = new HashSet<XName> { resourceTypeName, ownerName, supportedComponentsName };
			var prop404 = Common.xDAV.GetElement("prop", props
						.Where(p => !supportedProperties.Contains(p.Name))
						.Select(p => new XElement(p.Name))
				);
			var propStat404 = Common.xDAV.GetElement("propstat",
				Common.xDAV.GetElement("status", "HTTP/1.1 404 Not Found"), prop404);

			return new Result {
				Status = (System.Net.HttpStatusCode)207,
				Headers = new Dictionary<string, string> {
					{"DAV","1, calendar-access, calendar-schedule, calendar-proxy" }
				},
				Content = Common.xDAV.GetElement("multistatus",
					Common.xDAV.GetElement("response",
					Common.xDAV.GetElement("href", Request.RawUrl),
					Common.xDAV.GetElement("propstat",
								Common.xDAV.GetElement("status", "HTTP/1.1 200 OK"),
								Common.xDAV.GetElement("prop",
									resourceType, owner, supportedComponents
					//Common.xCaldav.GetElement("calendar-description", path),
					//Common.xApple.GetElement("calendar-color", "ff0000"),
					//Common.xDAV.GetElement("getcontenttype", "text/calendar; component=vevent"),
					//Common.xDAV.GetElement("displayname", calendar.Name),
								)
							),

							(prop404.Elements().Any() ? propStat404 : null)
					 )
				 )
			};
		}

		[Route(ROUTE, "mkcalendar")]
		public ActionResult MakeCalendar(string path) {
			var repo = GetService<ICalendarRepository>();
			repo.CreateCalendar(path);
			return new Result { Status = System.Net.HttpStatusCode.Created };
		}

		[Route(ROUTE, "get")]
		public ActionResult Get(string path) {
			return new Result();
		}

		[Route(ROUTE, "put")]
		public ActionResult Put(string path, string filename) {
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByPath(path);
			var input = GetRequestCalendar();
			var e = input.Items.FirstOrDefault();
			e.LastModified = DateTime.UtcNow;
			repo.Save(calendar, e);

			return new Result {
				Headers = new Dictionary<string, string> {
					{"Location",  Url.Action("Get", new { path = calendar.Path + "/" + e.UID + ".ics" })},
					{"ETag", e.Sequence + "-" + e.LastModified.ToString() }
				},
				Status = System.Net.HttpStatusCode.Created
			};
		}

		[Route(ROUTE, "report")]
		public ActionResult Report(string path) {
			var xdoc = GetRequestXml();
			if (xdoc == null) return new Result();

			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByPath(path);

			var request = xdoc.Root.Elements().FirstOrDefault();
			var filterElm = request.Element(CalDav.Common.xCaldav.GetName("filter"));
			var filter = filterElm == null ? null : new Filter(filterElm);
			var hrefs = xdoc.Descendants(CalDav.Common.xDAV.GetName("href")).Select(x => x.Value).ToArray();
			var getetag = xdoc.Descendants(CalDav.Common.xDAV.GetName("getetag")).FirstOrDefault();
			var calendardata = xdoc.Descendants(CalDav.Common.xCaldav.GetName("calendar-data")).FirstOrDefault();

			IQueryable<ICalendarObject> result = null;
			if (filter != null) result = repo.GetObjectsByFilter(filter);
			else if (hrefs.Any())
				result = hrefs.Select(x => repo.GetObjectByPath(x.Substring(BASE.Length + 2))).AsQueryable();

			if (result != null) {
				return new Result {
					Status = (System.Net.HttpStatusCode)207,
					Content = CalDav.Common.xDAV.GetElement("multistatus",
					result.Select(r =>
					 CalDav.Common.xDAV.GetElement("response",
						 CalDav.Common.xDAV.GetElement("href", new Uri(Request.Url, r.UID + ".ics")),
						 CalDav.Common.xDAV.GetElement("propstat",
							 CalDav.Common.xDAV.GetElement("status", "HTTP/1.1 200 OK"),
							 CalDav.Common.xDAV.GetElement("prop",
								 (getetag == null ? null : CalDav.Common.xDAV.GetElement("getetag")),
								 (calendardata == null ? null : CalDav.Common.xCaldav.GetElement("calendar-data",
										ToString(calendar, r)
								 ))
							 )
						 )
					 )
					))
				};
			}

			return new Result {
				Headers = new Dictionary<string, string> {
					{"ETag" , Common.FormatDate( repo.GetLastModifiedDate( calendar)) }
				}
			};
		}

		private ActionResult Options_CalendarCollectionSet() {
			var repo = GetService<ICalendarRepository>();
			var calendars = repo.List().ToArray();
			if (calendars.Length == 0)
				calendars = new[] { repo.CreateCalendar("me") };

			return new Result {
				Content = CalDav.Common.xDAV.GetElement("options-response",
				 CalDav.Common.xCaldav.GetElement("calendar-collection-set",
					 calendars.Select(calendar =>
						 CalDav.Common.xDAV.GetElement("href",
							 new Uri(Request.Url, Url.Action("Report", new { path = calendar.Path }) + "/")
							 ))
				 )
			 )
			};
		}

		[Route(ROUTE, null, Precedence = int.MaxValue)]
		public ActionResult NotImplemented() {
			return new Result { Status = System.Net.HttpStatusCode.NotImplemented };
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

		internal System.IO.Stream Stream { get; set; }

		XDocument GetRequestXml() {
			if (!(Request.ContentType ?? string.Empty).ToLower().Contains("xml"))
				return null;
			using (var str = (Stream ?? Request.GetBufferlessInputStream()))
				return XDocument.Load(str);
		}

		Models.Calendar GetRequestCalendar() {
			if (!(Request.ContentType ?? string.Empty).ToLower().Contains("calendar"))
				return null;
			var serializer = new Models.Serializer();
			using (var str = (Stream ?? Request.GetBufferlessInputStream())) {
				var ical = serializer.Deserialize<CalDav.CalendarCollection>(str, Request.ContentEncoding ?? System.Text.Encoding.Default);
				return (Models.Calendar)ical.FirstOrDefault();
			}
		}

		private static string ToString(Calendar calendar, ICalendarObject obj) {
			calendar.AddItem(obj);

			var serializer = new Server.Models.Serializer();
			using (var str = new System.IO.StringWriter()) {
				serializer.Serialize(str, calendar);
				return str.ToString();
			}
		}
	}
}
