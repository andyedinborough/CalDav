using CalDav.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Xml.Linq;
//http://greenbytes.de/tech/webdav/draft-dusseault-caldav-05.html
//http://wwcsd.net/principals/__uids__/wiki-ilovemysmartboard/

namespace CalDav.Server.Controllers {
	public class CalDavController : Controller {
		const string BASE = "caldav";
		const string ROUTE = "caldav/{*path}";
		const string CALENDAR_ROUTE = "caldav/calendar/{name}/{*path}";
		const string USER_ROUTE = "caldav/user/{name}/{*path}";

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
					{"Allow", "OPTIONS, PROPFIND, HEAD, GET, REPORT, PROPPATCH, PUT, DELETE, POST" },
					{"DAV", "1, calendar-access" } //, calendar-schedule, calendar-proxy"}
				}
			};
		}

		[Route(USER_ROUTE, "propfind")]
		public ActionResult UserPropFind(string path) {
			return null;
		}

		[Route(CALENDAR_ROUTE, "propfind")]
		public ActionResult CalendarPropFind(string name, string path) {
			var depth = Request.Headers["Depth"].ToInt() ?? 0;
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByName(name);
			if (calendar == null && name.Is("me")) {
				MakeCalendar(name);
				calendar = repo.GetCalendarByName(name);
			}

			var xdoc = GetRequestXml();
			var props = xdoc.Descendants(CalDav.Common.xDAV.GetName("prop")).FirstOrDefault().Elements();

			var allprop = props.Elements(Common.xDAV.GetName("allprops")).Any();

			var resourceTypeName = Common.xDAV.GetName("resourcetype");
			var resourceType = !allprop && !props.Any(x => x.Name == resourceTypeName) ? null :
				resourceTypeName.Element(Common.xDAV.Element("collection"), Common.xCaldav.Element("calendar"));

			var getetagName = Common.xDAV.GetName("getetag");
			var getetag = !allprop && !props.Any(x => x.Name == resourceTypeName) ? null :
				getetagName.Element();

			var ownerName = Common.xDAV.GetName("owner");
			var owner = !allprop && !props.Any(x => x.Name == ownerName) ? null :
				ownerName.Element(Common.xDAV.Element("href", Url.Action("UserPropFind", new { name = User.Identity.Name })));

			var displayNameName = Common.xDAV.GetName("displayname");
			var displayName = !allprop && !props.Any(x => x.Name == displayNameName) ? null :
				displayNameName.Element(calendar.Name);

			var calendarColorName = Common.xApple.GetName("calendar-color");
			var calendarColor = !allprop && !props.Any(x => x.Name == calendarColorName) ? null :
				calendarColorName.Element("FF5800");

			var calendarDescriptionName = Common.xCaldav.GetName("calendar-description");
			var calendarDescription = !allprop && !props.Any(x => x.Name == calendarDescriptionName) ? null :
				calendarDescriptionName.Element(calendar.Name);

			var supportedComponentsName = Common.xCaldav.GetName("supported-calendar-component-set");
			var supportedComponents = !allprop && !props.Any(x => x.Name == supportedComponentsName) ? null :
				new[]{
					Common.xCaldav.Element("comp", new XAttribute("name", "VEVENT")),
					Common.xCaldav.Element("comp", new XAttribute("name", "VTODO"))
				};

			var getContentTypeName = Common.xDAV.GetName("getcontenttype");
			var getContentType = !allprop && !props.Any(x => x.Name == getContentTypeName) ? null :
				getContentTypeName.Element("text/calendar; component=vevent");

			var supportedProperties = new HashSet<XName> { resourceTypeName, ownerName, supportedComponentsName, getContentTypeName, displayNameName, calendarDescriptionName, calendarColorName };
			var prop404 = Common.xDAV.Element("prop", props
						.Where(p => !supportedProperties.Contains(p.Name))
						.Select(p => new XElement(p.Name))
				);
			var propStat404 = Common.xDAV.Element("propstat",
				Common.xDAV.Element("status", "HTTP/1.1 404 Not Found"), prop404);

			return new Result {
				Status = (System.Net.HttpStatusCode)207,
				Headers = new Dictionary<string, string> {
					{"DAV","1, calendar-access, calendar-schedule, calendar-proxy" }
				},
				Content = Common.xDAV.Element("multistatus",
					Common.xDAV.Element("response",
					Common.xDAV.Element("href", Request.RawUrl),
					Common.xDAV.Element("propstat",
								Common.xDAV.Element("status", "HTTP/1.1 200 OK"),
								Common.xDAV.Element("prop",
									resourceType, owner, supportedComponents, displayName, getContentType, calendarDescription
					//Common.xCaldav.GetElement("calendar-description", path),
					//Common.xApple.GetElement("calendar-color", "ff0000"),
					//Common.xDAV.GetElement("getcontenttype", "text/calendar; component=vevent"),
					//Common.xDAV.GetElement("displayname", calendar.Name),
								)
							),

							(prop404.Elements().Any() ? propStat404 : null)
					 ),

					 (depth == 0 ? null :
						 (repo.GetObjects(calendar)
						 .OfType<Event>()
						 .ToArray()
							.Select(item => Common.xDAV.Element("response",
									Common.xDAV.Element("href", Url.Action("CalendarPropFind", new { name = calendar.Path, path = item.UID + ".ics" })),
									Common.xDAV.Element("propstat",
										Common.xDAV.Element("status", "HTTP/1.1 200 OK"),
										resourceType == null ? null : resourceTypeName.Element(),
										(getContentType == null ? null : getContentTypeName.Element("text/calendar; component=" + (item is Event ? "vevent" : item is ToDo ? "vtodo" : null))),
										getetag == null ? null : getetagName.Element(Common.FormatDate(item.LastModified.GetValueOrDefault()))
									)
								))
							.ToArray()))
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
			var calendar = repo.GetCalendarByName(path);
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

		[Route(CALENDAR_ROUTE, "report")]
		public ActionResult Report(string name, string path) {
			var xdoc = GetRequestXml();
			if (xdoc == null) return new Result();

			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByName(name);

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
					Content = CalDav.Common.xDAV.Element("multistatus",
					result.Select(r =>
					 CalDav.Common.xDAV.Element("response",
						 CalDav.Common.xDAV.Element("href", new Uri(Request.Url, r.UID + ".ics")),
						 CalDav.Common.xDAV.Element("propstat",
							 CalDav.Common.xDAV.Element("status", "HTTP/1.1 200 OK"),
							 CalDav.Common.xDAV.Element("prop",
								 (getetag == null ? null : CalDav.Common.xDAV.Element("getetag", Common.FormatDate(r.LastModified.GetValueOrDefault()))),
								 (calendardata == null ? null : CalDav.Common.xCaldav.Element("calendar-data",
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
			var calendars = repo.GetCalendars().ToArray();
			if (calendars.Length == 0)
				calendars = new[] { repo.CreateCalendar("me") };

			return new Result {
				Content = CalDav.Common.xDAV.Element("options-response",
				 CalDav.Common.xCaldav.Element("calendar-collection-set",
					 calendars.Select(calendar =>
						 CalDav.Common.xDAV.Element("href",
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
			if (!(Request.ContentType ?? string.Empty).ToLower().Contains("xml") || Request.ContentLength == 0)
				return null;
			using (var str = (Stream ?? Request.GetBufferlessInputStream()))
				return XDocument.Load(str);
		}

		Models.Calendar GetRequestCalendar() {
			if (!(Request.ContentType ?? string.Empty).ToLower().Contains("calendar") || Request.ContentLength == 0)
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
