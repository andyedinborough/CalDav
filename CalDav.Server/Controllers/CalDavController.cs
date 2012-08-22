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
		const string BASE_CALENDAR = "caldav/calendar";
		const string ROUTE = "caldav/{*path}";
		const string CALENDAR_ROUTE = "caldav/calendar/{id}/{*path}";
		const string USER_ROUTE = "caldav/user/{id}/{*path}";

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
		public ActionResult UserPropFind(string id, string path) {
			return null;
		}

		[Route(ROUTE, "PROPFIND")]
		public ActionResult PropFind() {
			return CalendarPropFind("me", null);
		}

		private string GetUserUrl(string id = null) {
			if (string.IsNullOrEmpty(id)) id = User.Identity.Name;
			if (string.IsNullOrEmpty(id)) id = "ANONYMOUS";
			return "/" + USER_ROUTE.Replace("{id}", id).Replace("{*path}", string.Empty);
		}

		private string GetUserEmail(string id = null) {
			if (string.IsNullOrEmpty(id)) id = User.Identity.Name;
			return id + "@" + Request.Url.Host;
		}
		private string GetCalendarUrl(string id) {
			return "/" + CALENDAR_ROUTE.Replace("{id}", id).Replace("{*path}", string.Empty);
		}
		private string GetCalendarObjectUrl(string id, string uid) {
			return "/" + CALENDAR_ROUTE.Replace("{id}", id).Replace("{*path}", uid + ".ics");
		}

		[Route(CALENDAR_ROUTE, "propfind")]
		public ActionResult CalendarPropFind(string id, string path) {
			var depth = Request.Headers["Depth"].ToInt() ?? 0;
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByID(id);
			if (calendar == null && id.Is("me")) {
				MakeCalendar(id);
				calendar = repo.GetCalendarByID(id);
			}

			var xdoc = GetRequestXml();
			var props = xdoc.Descendants(CalDav.Common.xDav.GetName("prop")).FirstOrDefault().Elements();

			var allprop = props.Elements(Common.xDav.GetName("allprops")).Any();
			var hrefName = Common.xDav.GetName("href");
			//var scheduleInboxURLName = Common.xCalDav.GetName("schedule-inbox-URL");
			//var scheduleOutoxURLName = Common.xCalDav.GetName("schedule-outbox-URL");
			//var addressbookHomeSetName = Common.xCalDav.GetName("addressbook-home-set");

			var calendarUserAddressSetName = Common.xCalDav.GetName("calendar-user-address-set");
			var calendarUserAddress = !allprop && !props.Any(x => x.Name == calendarUserAddressSetName) ? null :
				calendarUserAddressSetName.Element(
					hrefName.Element(GetUserUrl()),
					hrefName.Element("mailto:" + GetUserEmail())
				);

			var calendarHomeSetName = Common.xCalDav.GetName("calendar-home-set");
			var calendarHomeSet = !allprop && !props.Any(x => x.Name == calendarHomeSetName) ? null :
				calendarHomeSetName.Element(hrefName.Element(GetUserUrl()));

			var getetagName = Common.xDav.GetName("getetag");
			var getetag = !allprop && !props.Any(x => x.Name == getetagName) ? null :
				getetagName.Element();

			var currentUserPrincipalName = Common.xDav.GetName("current-user-principal");
			var currentUserPrincipal = !allprop && !props.Any(x => x.Name == currentUserPrincipalName) ? null :
				currentUserPrincipalName.Element(hrefName.Element(GetUserUrl()));

			var resourceTypeName = Common.xDav.GetName("resourcetype");
			var resourceType = !allprop && !props.Any(x => x.Name == resourceTypeName) ? null : (
				currentUserPrincipal != null
					? resourceTypeName.Element(Common.xDav.Element("principal"))
					: resourceTypeName.Element(Common.xDav.Element("collection"), Common.xCalDav.Element("calendar"))
				);

			var ownerName = Common.xDav.GetName("owner");
			var owner = !allprop && !props.Any(x => x.Name == ownerName) ? null :
				ownerName.Element(hrefName.Element(GetUserUrl()));

			var displayNameName = Common.xDav.GetName("displayname");
			var displayName = calendar == null || (!allprop && !props.Any(x => x.Name == displayNameName)) ? null :
				displayNameName.Element(calendar.Name);

			var calendarColorName = Common.xApple.GetName("calendar-color");
			var calendarColor = !allprop && !props.Any(x => x.Name == calendarColorName) ? null :
				calendarColorName.Element("FF5800");

			var calendarDescriptionName = Common.xCalDav.GetName("calendar-description");
			var calendarDescription = calendar == null || (!allprop && !props.Any(x => x.Name == calendarDescriptionName)) ? null :
				calendarDescriptionName.Element(calendar.Name);

			var supportedComponentsName = Common.xCalDav.GetName("supported-calendar-component-set");
			var supportedComponents = !allprop && !props.Any(x => x.Name == supportedComponentsName) ? null :
				new[]{
					Common.xCalDav.Element("comp", new XAttribute("name", "VEVENT")),
					Common.xCalDav.Element("comp", new XAttribute("name", "VTODO"))
				};

			var getContentTypeName = Common.xDav.GetName("getcontenttype");
			var getContentType = !allprop && !props.Any(x => x.Name == getContentTypeName) ? null :
				getContentTypeName.Element("text/calendar; component=vevent");

			var supportedProperties = new HashSet<XName> { 
				resourceTypeName, ownerName, supportedComponentsName, getContentTypeName,
				displayNameName, calendarDescriptionName, calendarColorName,
				currentUserPrincipalName, calendarHomeSetName, calendarUserAddressSetName
			};
			var prop404 = Common.xDav.Element("prop", props
						.Where(p => !supportedProperties.Contains(p.Name))
						.Select(p => new XElement(p.Name))
				);
			var propStat404 = Common.xDav.Element("propstat",
				Common.xDav.Element("status", "HTTP/1.1 404 Not Found"), prop404);

			return new Result {
				Status = (System.Net.HttpStatusCode)207,
				Headers = new Dictionary<string, string> {
					{"DAV","1, calendar-access, calendar-schedule, calendar-proxy" }
				},
				Content = Common.xDav.Element("multistatus",
					Common.xDav.Element("response",
					Common.xDav.Element("href", Request.RawUrl),
					Common.xDav.Element("propstat",
								Common.xDav.Element("status", "HTTP/1.1 200 OK"),
								Common.xDav.Element("prop",
									resourceType, owner, supportedComponents, displayName,
									getContentType, calendarDescription,
									currentUserPrincipal
								)
							),

							(prop404.Elements().Any() ? propStat404 : null)
					 ),

					 (depth == 0 ? null :
						 (repo.GetObjects(calendar)
						 .OfType<Event>()
						 .Where(x => x != null)
						 .ToArray()
							.Select(item => Common.xDav.Element("response",
								hrefName.Element(GetCalendarObjectUrl(id, item.UID)),
									Common.xDav.Element("propstat",
										Common.xDav.Element("status", "HTTP/1.1 200 OK"),
										resourceType == null ? null : resourceTypeName.Element(),
										(getContentType == null ? null : getContentTypeName.Element("text/calendar; component=v" + item.GetType().Name.ToLower())),
										getetag == null ? null : getetagName.Element("\"" + Common.FormatDate(item.LastModified) + "\"")
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

		[Route(CALENDAR_ROUTE, "delete")]
		public ActionResult Delete(string id, string path) {
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByID(id);
			repo.DeleteObject(calendar, path);
			return new Result();
		}

		[Route(CALENDAR_ROUTE, "put")]
		public ActionResult Put(string id, string path) {
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByID(id);
			var input = GetRequestCalendar();
			var e = input.Items.FirstOrDefault();
			e.LastModified = DateTime.UtcNow;
			repo.Save(calendar, e);


			return new Result {
				Headers = new Dictionary<string, string> {
					{"Location", GetCalendarObjectUrl(id, e.UID) },
					{"ETag", e.Sequence + "-" + e.LastModified.ToString() }
				},
				Status = System.Net.HttpStatusCode.Created
			};
		}

		[Route(CALENDAR_ROUTE, "report")]
		public ActionResult Report(string id, string path) {
			var xdoc = GetRequestXml();
			if (xdoc == null) return new Result();

			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByID(id);

			var request = xdoc.Root.Elements().FirstOrDefault();
			var filterElm = request.Element(CalDav.Common.xCalDav.GetName("filter"));
			var filter = filterElm == null ? null : new Filter(filterElm);
			var hrefName = CalDav.Common.xDav.GetName("href");
			var hrefs = xdoc.Descendants(hrefName).Select(x => x.Value).ToArray();
			var getetagName = CalDav.Common.xDav.GetName("getetag");
			var getetag = xdoc.Descendants(getetagName).FirstOrDefault();
			var calendarDataName = CalDav.Common.xCalDav.GetName("calendar-data");
			var calendarData = xdoc.Descendants(calendarDataName).FirstOrDefault();

			var ownerName = Common.xDav.GetName("owner");
			var displaynameName = Common.xDav.GetName("displayname");

			IQueryable<ICalendarObject> result = null;
			if (filter != null) result = repo.GetObjectsByFilter(calendar, filter);
			else if (hrefs.Any())
				result = hrefs.Select(x => repo.GetObjectByPath(Uri.UnescapeDataString(x.Substring(BASE_CALENDAR.Length + 2))))
					.Where(x => x != null)
					.AsQueryable();

			if (result != null) {
				return new Result {
					Status = (System.Net.HttpStatusCode)207,
					Content = CalDav.Common.xDav.Element("multistatus",
					result.Select(r =>
					 CalDav.Common.xDav.Element("response",
						 CalDav.Common.xDav.Element("href", new Uri(Request.Url, r.UID + ".ics")),
						 CalDav.Common.xDav.Element("propstat",
							 CalDav.Common.xDav.Element("status", "HTTP/1.1 200 OK"),
							 CalDav.Common.xDav.Element("prop",
								(getetag == null ? null : CalDav.Common.xDav.Element("getetag", "\"" + Common.FormatDate(r.LastModified) + "\"")),
								(calendarData == null ? null : CalDav.Common.xCalDav.Element("calendar-data",
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
				Content = CalDav.Common.xDav.Element("options-response",
				 CalDav.Common.xCalDav.Element("calendar-collection-set",
					 calendars.Select(calendar =>
						 CalDav.Common.xDav.Element("href",
							 new Uri(Request.Url, GetCalendarUrl(calendar.Name))
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
