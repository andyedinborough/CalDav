using CalDav.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.Mvc;
using System.Xml.Linq;

namespace CalDav.Server.Controllers
{
    public class CalDavController : Controller
    {
        private static string BASE;
        private static string CALENDAR_ROUTE;
        private static string OBJECT_ROUTE;
        private static string CALENDAR_OBJECT_ROUTE;
        private static string USER_ROUTE;
        private static Regex _rxObjectRoute;

        public static bool DisallowMakeCalendar { get; set; }
        public static bool RequireAuthentication { get; set; }
        public static string BasicAuthenticationRealm { get; set; }

        private readonly List<IDisposable> _disposables = new List<IDisposable>();

        private System.IO.Stream Stream { get; set; }

        public static void RegisterRoutes(System.Web.Routing.RouteCollection routes, string routePrefix = "caldav", bool disallowMakeCalendar = false, bool requireAuthentication = false, string basicAuthenticationRealm = null)
        {
            RegisterRoutes<CalDavController>(routes, routePrefix, disallowMakeCalendar, requireAuthentication, basicAuthenticationRealm);
        }

        public static void RegisterRoutes<T>(System.Web.Routing.RouteCollection routes, string routePrefix = "caldav", bool disallowMakeCalendar = false, bool requireAuthentication = false, string basicAuthenticationRealm = null)
            where T : CalDavController
        {
            var caldavControllerType = typeof(T);

            var namespaces = new[] { caldavControllerType.Namespace };
            var controller = caldavControllerType.Name;
            if (caldavControllerType.Name.EndsWith("Controller", StringComparison.OrdinalIgnoreCase))
                controller = caldavControllerType.Name.Substring(0, caldavControllerType.Name.Length - "controller".Length);

            var defaults = new { controller, action = "index" };

            MapFirst(routes, "CalDav Root", string.Empty, new { controller, action = "PropFind" }, namespaces, new { httpMethod = new Method("PROPFIND") });
            MapFirst(routes, "CalDav", BASE = routePrefix, defaults, namespaces);
            MapFirst(routes, "CalDav", BASE = routePrefix, defaults, namespaces);
            MapFirst(routes, "CalDav User", USER_ROUTE = routePrefix + "/user/{id}/", defaults, namespaces);
            MapFirst(routes, "CalDav Calendar", CALENDAR_ROUTE = routePrefix + "/calendar/{id}/", defaults, namespaces);
            MapFirst(routes, "CalDav Object", OBJECT_ROUTE = routePrefix + "/{uid}.ics", defaults, namespaces);
            MapFirst(routes, "CalDav Calendar Object", CALENDAR_OBJECT_ROUTE = routePrefix + "/calendar/{id}/{uid}.ics", defaults, namespaces);

            _rxObjectRoute = new Regex(routePrefix + "(/calendar/(?<id>[^/]+))?/(?<uid>.+?).ics", RegexOptions.Compiled | RegexOptions.IgnoreCase);

            RequireAuthentication = requireAuthentication;
            BasicAuthenticationRealm = basicAuthenticationRealm;
            DisallowMakeCalendar = disallowMakeCalendar;
        }

        private static void MapFirst(System.Web.Routing.RouteCollection routes, string name, string path, object defaults, string[] namespaces, object constraints = null)
        {
            var route = routes.MapRoute(name, path, defaults);

            if (constraints != null)
            {
                route.Constraints = new System.Web.Routing.RouteValueDictionary(constraints);
            }

            routes.Remove(route);
            routes.Insert(0, route);
        }

        public virtual ActionResult Index(string id, string uid)
        {
            if (RequireAuthentication && !User.Identity.IsAuthenticated)
            {
                return new Result
                {
                    Status = System.Net.HttpStatusCode.Unauthorized,
                    Headers = BasicAuthenticationRealm == null ? null : new Dictionary<string, string> {
							{"WWW-Authenticate", "Basic realm=\"" + Request.Url.Host + "\"" }
					 }
                };
            }

            switch (Request.HttpMethod)
            {
                case "OPTIONS": return Options();
                case "PROPFIND": return PropFind(id);
                case "REPORT": return Report(id);
                case "DELETE": return Delete(id, uid);
                case "PUT": return Put(id, uid);
                case "MKCALENDAR":
                    if (DisallowMakeCalendar) return NotImplemented();
                    return MakeCalendar(id);
                case "GET": return Get(id, uid);
                default: return NotImplemented();
            }
        }

        protected virtual string GetUserUrl(string id = null)
        {
            if (string.IsNullOrEmpty(id))
            {
                return GetCalendarUrl(null);
            }

            //id = User.Identity.Name;
            if (string.IsNullOrEmpty(id))
            {
                id = "ANONYMOUS";
            }

            return "/" + USER_ROUTE.Replace("{id}", Uri.EscapeDataString(id)).Replace("{*path}", string.Empty);
        }

        protected virtual string GetUserEmail(string id = null)
        {
            if (string.IsNullOrEmpty(id))
            {
                id = User.Identity.Name;
            }

            return id + "@" + Request.Url.Host;
        }

        protected virtual string GetCalendarUrl(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return "/" + BASE;
            }

            return "/" + CALENDAR_ROUTE.Replace("{id}", Uri.EscapeDataString(id));
        }

        protected virtual string GetCalendarObjectUrl(string id, string uid)
        {
            uid = String.IsNullOrEmpty(uid) ? "" : uid;

            if (string.IsNullOrEmpty(id))
            {
                return "/" + OBJECT_ROUTE.Replace("{uid}", Uri.EscapeDataString(uid));
            }

            return "/" + CALENDAR_OBJECT_ROUTE.Replace("{id}", Uri.EscapeDataString(id)).Replace("{uid}", Uri.EscapeDataString(uid));
        }

        protected virtual string GetObjectUIDFromPath(string path)
        {
            return _rxObjectRoute.Match(path).Groups["uid"].Value;
        }

        public virtual ActionResult Options()
        {
            var xdoc = GetRequestXml();

            if (xdoc != null)
            {
                var request = xdoc.Root.Elements().FirstOrDefault();
                switch (request.Name.LocalName.ToLower())
                {
                    case "calendar-collection-set":
                        var repo = GetService<ICalendarRepository>();
                        var calendars = repo.GetCalendars().ToArray();

                        return new Result
                        {
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

            return new Result
            {
                Headers = new Dictionary<string, string> {
					{"Allow", "OPTIONS, PROPFIND, HEAD, GET, REPORT, PROPPATCH, PUT, DELETE, POST" }
				}
            };
        }

        public virtual ActionResult PropFind(string id)
        {
            var depth = Request.Headers["Depth"].ToInt() ?? 0;
            var repo = GetService<ICalendarRepository>();
            var calendar = repo.GetCalendarByID(id);

            var xdoc = GetRequestXml();
            var prop = xdoc.Descendants(CalDav.Common.xDav.GetName("prop")).FirstOrDefault();

            Result result;

            if (prop != null)
            {
                var props = prop.Elements().ToList();

                var allprop = props.Elements(Common.xDav.GetName("allprops")).Any();
                var hrefName = Common.xDav.GetName("href");

                //var scheduleInboxURLName = Common.xCalDav.GetName("schedule-inbox-URL");
                //var scheduleOutoxURLName = Common.xCalDav.GetName("schedule-outbox-URL");
                //var addressbookHomeSetName = Common.xCalDav.GetName("addressbook-home-set");

                var calendarUserAddressSetName = Common.xCalDav.GetName("calendar-user-address-set");
                var calendarUserAddress = !allprop && props.All(x => x.Name != calendarUserAddressSetName)
                    ? null
                    : calendarUserAddressSetName.Element(hrefName.Element(GetUserUrl()),
                        hrefName.Element("mailto:" + GetUserEmail()));


                var supportedReportSetName = Common.xDav.GetName("supported-report-set");

                var supportedReportSet = !allprop && props.All(x => x.Name != supportedReportSetName)
                    ? null
                    : supportedReportSetName.Element(Common.xDav.Element("supported-report",
                        Common.xDav.Element("report", Common.xDav.Element("calendar-multiget"))));

                var calendarHomeSetName = Common.xCalDav.GetName("calendar-home-set");
                var calendarHomeSet = !allprop && props.All(x => x.Name != calendarHomeSetName)
                    ? null
                    : calendarHomeSetName.Element(hrefName.Element(GetUserUrl()));

                var getetagName = Common.xDav.GetName("getetag");

                var getetag = !allprop && props.All(x => x.Name != getetagName)
                    ? null
                    : getetagName.Element();

                var currentUserPrincipalName = Common.xDav.GetName("current-user-principal");

                var currentUserPrincipal = props.All(x => x.Name != currentUserPrincipalName)
                    ? null
                    : currentUserPrincipalName.Element(hrefName.Element(GetUserUrl()));

                var resourceTypeName = Common.xDav.GetName("resourcetype");

                var resourceType = !allprop && props.All(x => x.Name != resourceTypeName)
                    ? null
                    : (resourceTypeName.Element(Common.xDav.Element("collection"), Common.xCalDav.Element("calendar"),
                        Common.xDav.Element("principal")));

                var ownerName = Common.xDav.GetName("owner");
                var owner = !allprop && props.All(x => x.Name != ownerName)
                    ? null
                    : ownerName.Element(hrefName.Element(GetUserUrl()));

                var displayNameName = Common.xDav.GetName("displayname");
                var displayName = calendar == null || (!allprop && props.All(x => x.Name != displayNameName))
                    ? null
                    : displayNameName.Element(calendar.Name ?? calendar.ID);

                var calendarColorName = Common.xApple.GetName("calendar-color");
                var calendarColor = !allprop && props.All(x => x.Name != calendarColorName)
                    ? null
                    : calendarColorName.Element("FF5800");

                var calendarDescriptionName = Common.xCalDav.GetName("calendar-description");
                var calendarDescription = calendar == null ||
                                          (!allprop && props.All(x => x.Name != calendarDescriptionName))
                    ? null
                    : calendarDescriptionName.Element(calendar.Name);

                var supportedComponentsName = Common.xCalDav.GetName("supported-calendar-component-set");

                var supportedComponents = !allprop && props.All(x => x.Name != supportedComponentsName)
                    ? null
                    : new[]
                    {
                        Common.xCalDav.Element("comp", new XAttribute("name", "VEVENT")),
                        Common.xCalDav.Element("comp", new XAttribute("name", "VTODO"))
                    };

                var getContentTypeName = Common.xDav.GetName("getcontenttype");

                var getContentType = !allprop && props.All(x => x.Name != getContentTypeName)
                    ? null
                    : getContentTypeName.Element("text/calendar; component=vevent");

                var supportedProperties = new HashSet<XName>
                {
                    resourceTypeName,
                    ownerName,
                    supportedComponentsName,
                    getContentTypeName,
                    displayNameName,
                    calendarDescriptionName,
                    calendarColorName,
                    currentUserPrincipalName,
                    calendarHomeSetName,
                    calendarUserAddressSetName,
                    supportedComponentsName
                };

                var prop404 = Common.xDav.Element("prop",
                    props.Where(p => !supportedProperties.Contains(p.Name)).Select(p => new XElement(p.Name)));
                var propStat404 = Common.xDav.Element("propstat",
                    Common.xDav.Element("status", "HTTP/1.1 404 Not Found"), prop404);

                Object status = prop404.Elements().Any() ? propStat404 : null;
                status = null;

                var response = Common.xDav.Element("response",
                    Common.xDav.Element("href", Request.RawUrl),
                    Common.xDav.Element("propstat",
                        Common.xDav.Element("status", "HTTP/1.1 200 OK"),
                        Common.xDav.Element("prop",
                            resourceType, owner, supportedComponents, displayName,
                            getContentType, calendarDescription, calendarHomeSet,
                            currentUserPrincipal, supportedReportSet, calendarColor,
                            calendarUserAddress)
                        ), status);

                var calendarObjects = repo.GetObjects(calendar).Where(x => x != null).ToArray();

                var calendarItems = calendarObjects.Select(item => Common.xDav.Element("response",
                    hrefName.Element(GetCalendarObjectUrl(calendar.ID, item.UID)),
                    Common.xDav.Element("propstat",
                        Common.xDav.Element("status", "HTTP/1.1 200 OK"),
                        resourceType == null ? null : resourceTypeName.Element(),
                        (getContentType == null
                            ? null
                            : getContentTypeName.Element("text/calendar; component=v" + item.GetType().Name.ToLower())),
                        getetag == null
                            ? null
                            : getetagName.Element("\"" + Common.FormatDate(item.LastModified) + "\"")
                        ))).ToArray();


                var objects = calendarItems; //(depth == 0 ? null : calendarItems);

                result = new Result
                {
                    Status = (System.Net.HttpStatusCode)207,
                    Content = Common.xDav.Element("multistatus", response, objects)
                };
            }
            else
            {
                var response = Common.xDav.Element("response",
                    Common.xDav.Element("href", Request.RawUrl),
                    Common.xDav.Element("propstat",
                        Common.xDav.Element("status", "HTTP/1.1 200 OK")));

                result = new Result
                {
                    Status = (System.Net.HttpStatusCode)207,
                    Content = Common.xDav.Element("multistatus", response, null)
                };
            }

            return result;
        }

        public virtual ActionResult MakeCalendar(string id)
        {
            var repo = GetService<ICalendarRepository>();
            var calendar = repo.CreateCalendar(id);

            return new Result
            {
                Headers = new Dictionary<string, string> {
					{"Location", GetCalendarUrl(calendar.ID) },
				},
                Status = System.Net.HttpStatusCode.Created
            };
        }

        public virtual ActionResult Delete(string id, string uid)
        {
            var repo = GetService<ICalendarRepository>();
            var calendar = repo.GetCalendarByID(id);
            repo.DeleteObject(calendar, uid);
            return new Result();
        }

        public virtual ActionResult Put(string id, string uid)
        {
            var repo = GetService<ICalendarRepository>();
            var calendar = repo.GetCalendarByID(id);
            var input = GetRequestCalendar();
            var e = input.Items.FirstOrDefault();
            e.LastModified = DateTime.UtcNow;
            repo.Save(calendar, e);

            return new Result
            {
                Headers = new Dictionary<string, string> {
					{"Location", GetCalendarObjectUrl(calendar.ID, e.UID) },
					{"ETag", Common.FormatDate(e.LastModified) }
				},
                Status = System.Net.HttpStatusCode.Created
            };
        }

        public virtual ActionResult Get(string id, string uid)
        {
            var repo = GetService<ICalendarRepository>();
            var calendar = repo.GetCalendarByID(id);
            var obj = repo.GetObjectByUID(calendar, uid);

            Response.ContentType = "text/calendar";
            Response.Write(ToString(obj));
            return null;
        }

        public virtual ActionResult Report(string id)
        {
            var xdoc = GetRequestXml();

            if (xdoc == null)
            {
                return new Result();
            }

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

            if (result != null)
            {
                return new Result
                {
                    Status = (System.Net.HttpStatusCode)207,
                    Content = CalDav.Common.xDav.Element("multistatus",
                        result.Select(r =>
                            CalDav.Common.xDav.Element("response",
                                CalDav.Common.xDav.Element("href", new Uri(Request.Url, r.UID + ".ics")),
                                CalDav.Common.xDav.Element("propstat",
                                    CalDav.Common.xDav.Element("status", "HTTP/1.1 200 OK"),
                                    CalDav.Common.xDav.Element("prop",
                                        (getetag == null
                                            ? null
                                            : CalDav.Common.xDav.Element("getetag",
                                                "\"" + Common.FormatDate(r.LastModified) + "\"")),
                                        (calendarData == null
                                            ? null
                                            : CalDav.Common.xCalDav.Element("calendar-data",
                                                ToString(r)
                                                ))
                                        )
                                    )
                                )
                            ))
                };
            }

            return new Result
            {
                Headers = new Dictionary<string, string> {
					{"ETag" , calendar == null ? null : Common.FormatDate( calendar.LastModified ) }
				}
            };
        }

        public ActionResult NotImplemented()
        {
            return new Result { Status = System.Net.HttpStatusCode.NotImplemented };
        }

        private static ICalendarRepository _service;

        public static void RegisterService(ICalendarRepository service)
        {
            _service = service;
        }

        private T GetService<T>()
        {
            if (typeof(T) == typeof(ICalendarRepository))
            {
                return (T)_service;
            }

            var obj = System.Web.Mvc.DependencyResolver.Current.GetService<T>();

            if (obj != null && obj is IDisposable)
            {
                _disposables.Add(obj as IDisposable);
            }

            return obj;
        }

        protected override void OnResultExecuted(ResultExecutedContext filterContext)
        {
            base.OnResultExecuted(filterContext);

            foreach (var disposable in _disposables)
            {
                if (disposable != null)
                {
                    try
                    {
                        disposable.Dispose();
                    }
                    catch (Exception) { }
                }
            }
        }

        private XDocument GetRequestXml()
        {
            if (!(Request.ContentType ?? string.Empty).ToLower().Contains("xml") || Request.ContentLength == 0)
            {
                return null;
            }

            using (var stream = (Stream ?? Request.InputStream))
            {
                return XDocument.Load(stream);
            }
        }

        private Calendar GetRequestCalendar()
        {
            if (!(Request.ContentType ?? string.Empty).ToLower().Contains("calendar") || Request.ContentLength == 0)
            {
                return null;
            }

            var serializer = new Serializer();

            using (var str = (Stream ?? Request.InputStream))
            {
                var ical = serializer.Deserialize<CalDav.CalendarCollection>(str, Request.ContentEncoding ?? System.Text.Encoding.Default);
                return ical.FirstOrDefault();
            }
        }

        private static string ToString(ICalendarObject obj)
        {
            var calendar = new CalDav.Calendar();
            calendar.AddItem(obj);

            var serializer = new Serializer();

            using (var str = new System.IO.StringWriter())
            {
                serializer.Serialize(str, calendar);
                return str.ToString();
            }
        }
    }
}
