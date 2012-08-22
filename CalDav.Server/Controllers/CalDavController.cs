using CalDav.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.Mvc;
using System.Xml.Linq;
//http://greenbytes.de/tech/webdav/draft-dusseault-caldav-05.html
//http://wwcsd.net/principals/__uids__/wiki-ilovemysmartboard/

namespace CalDav.Server.Controllers {
	public class CalDavController : Controller {
		const string BASE = "caldav";
		const string BASE_CALENDAR = "caldav/calendar";
		const string ROUTE = "caldav/{*path}";
		const string CALENDAR_ROUTE = "caldav/calendar/{id}/";
		const string OBJECT_ROUTE = "caldav/{uid}.ics";
		const string CALENDAR_OBJECT_ROUTE = "caldav/calendar/{id}/{uid}.ics";
		const string USER_ROUTE = "caldav/user/{id}/";
		private static readonly Regex rxObjectRoute = new Regex("caldav(/calendar/(?<id>[^/]+))?/(?<uid>.+?).ics", RegexOptions.Compiled | RegexOptions.IgnoreCase);

		private string GetUserUrl(string id = null) {
			if (string.IsNullOrEmpty(id)) id = User.Identity.Name;
			if (string.IsNullOrEmpty(id)) id = "ANONYMOUS";
			return "/" + USER_ROUTE.Replace("{id}", Uri.EscapeDataString(id)).Replace("{*path}", string.Empty);
		}

		private string GetUserEmail(string id = null) {
			if (string.IsNullOrEmpty(id)) id = User.Identity.Name;
			return id + "@" + Request.Url.Host;
		}
		private string GetCalendarUrl(string id) {
			return "/" + CALENDAR_ROUTE.Replace("{id}", Uri.EscapeDataString(id));
		}
		private string GetCalendarObjectUrl(string id, string uid) {
			return "/" + CALENDAR_OBJECT_ROUTE.Replace("{id}", Uri.EscapeDataString(id)).Replace("{uid}", Uri.EscapeDataString(uid));
		}
		private string GetObjectUIDFromPath(string path) {
			return rxObjectRoute.Match(path).Groups["uid"].Value;
		}

		[Route(ROUTE, "options")]
		[Route(CALENDAR_ROUTE, "options")]
		public ActionResult Options() {
			var xdoc = GetRequestXml();
			if (xdoc != null) {
				var request = xdoc.Root.Elements().FirstOrDefault();
				switch (request.Name.LocalName.ToLower()) {
					case "calendar-collection-set":
						var repo = GetService<ICalendarRepository>();
						var calendars = repo.GetCalendars().ToArray();

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
			}

			return new Result {
				Headers = new Dictionary<string, string> {
					{"Allow", "OPTIONS, PROPFIND, HEAD, GET, REPORT, PROPPATCH, PUT, DELETE, POST" },
					{"DAV", "1, calendar-access" } //, calendar-schedule, calendar-proxy"}
				}
			};
		}

		[Route(USER_ROUTE, "propfind")]
		public ActionResult UserPropFind(string id) {
			return null;
		}

		[Route(ROUTE, "propfind")]
		[Route(CALENDAR_ROUTE, "propfind")]
		public ActionResult CalendarPropFind(string id) {
			var depth = Request.Headers["Depth"].ToInt() ?? 0;
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByID(id);

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
				displayNameName.Element(calendar.Name ?? calendar.ID);

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
						 .Where(x => x != null)
						 .ToArray()
							.Select(item => Common.xDav.Element("response",
								hrefName.Element(GetCalendarObjectUrl(calendar.ID, item.UID)),
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

		[Route(CALENDAR_ROUTE, "mkcalendar")]
		public ActionResult MakeCalendar(string id) {
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.CreateCalendar(id);

			return new Result {
				Headers = new Dictionary<string, string> {
					{"Location", GetCalendarUrl(calendar.ID) },
				},
				Status = System.Net.HttpStatusCode.Created
			};
		}

		[Route(OBJECT_ROUTE, "delete")]
		[Route(CALENDAR_OBJECT_ROUTE, "delete")]
		public ActionResult Delete(string id, string uid) {
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByID(id);
			repo.DeleteObject(calendar, uid);
			return new Result();
		}

		[Route(OBJECT_ROUTE, "put")]
		[Route(CALENDAR_OBJECT_ROUTE, "put")]
		public ActionResult Put(string id, string uid) {
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByID(id);
			var input = GetRequestCalendar();
			var e = input.Items.FirstOrDefault();
			e.LastModified = DateTime.UtcNow;
			repo.Save(calendar, e);

			return new Result {
				Headers = new Dictionary<string, string> {
					{"Location", GetCalendarObjectUrl(calendar.ID, e.UID) },
					{"ETag", Common.FormatDate(e.LastModified) }
				},
				Status = System.Net.HttpStatusCode.Created
			};
		}

		[Route(OBJECT_ROUTE, "get")]
		[Route(CALENDAR_OBJECT_ROUTE, "get")]
		public ActionResult Get(string id, string uid) {
			var repo = GetService<ICalendarRepository>();
			var calendar = repo.GetCalendarByID(id);
			var obj = repo.GetObjectByUID(calendar, uid);

			Response.ContentType = "text/calendar";
			Response.Write(ToString(obj));
			return null;
		}

		[Route(ROUTE, "report")]
		[Route(CALENDAR_ROUTE, "report")]
		public ActionResult CalendarReport(string id) {
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
				result = hrefs.Select(x => repo.GetObjectByUID(calendar, GetObjectUIDFromPath(x)))
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
									ToString(r)
								))
							 )
						 )
					 )
					))
				};
			}

			return new Result {
				Headers = new Dictionary<string, string> {
					{"ETag" , calendar == null ? null : Common.FormatDate( calendar.LastModified ) }
				}
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

		private XDocument GetRequestXml() {
			if (!(Request.ContentType ?? string.Empty).ToLower().Contains("xml") || Request.ContentLength == 0)
				return null;
			using (var str = (Stream ?? Request.GetBufferlessInputStream()))
				return XDocument.Load(str);
		}

		private Calendar GetRequestCalendar() {
			if (!(Request.ContentType ?? string.Empty).ToLower().Contains("calendar") || Request.ContentLength == 0)
				return null;
			var serializer = new Serializer();
			using (var str = (Stream ?? Request.GetBufferlessInputStream())) {
				var ical = serializer.Deserialize<CalDav.CalendarCollection>(str, Request.ContentEncoding ?? System.Text.Encoding.Default);
				return ical.FirstOrDefault();
			}
		}

		private static string ToString(ICalendarObject obj) {
			var calendar = new CalDav.Calendar();
			calendar.AddItem(obj);
			var serializer = new Serializer();
			using (var str = new System.IO.StringWriter()) {
				serializer.Serialize(str, calendar);
				return str.ToString();
			}
		}
	}
}
