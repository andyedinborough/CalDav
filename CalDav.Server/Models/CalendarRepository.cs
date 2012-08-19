using System.Linq;
using System.Security.Principal;

namespace CalDav.Server.Models {
	public interface ICalendarRepository {
		IQueryable<Calendar> List();
		Calendar GetCalendarByPath(string path);
		Calendar CreateCalendar(string path);
		Event GetEventByUID(string uid);
		void Save(Calendar calendar, Event e);
	}

	public class CalendarRepository : ICalendarRepository {
		private string _Directory;

		public CalendarRepository(IPrincipal user) {
			_Directory = System.IO.Path.Combine(System.Web.HttpRuntime.AppDomainAppPath, "App_Data\\Calendars");
			System.IO.Directory.CreateDirectory(_Directory);
		}

		public IQueryable<Calendar> List() {
			var files = System.IO.Directory.GetFiles(_Directory, "*.ical");
			return files.Select(x => {
				using (var file = System.IO.File.OpenText(x)) {
					var serializer = new CalDav.Server.Models.Serializer();
					var col = serializer.Deserialize<CalDav.CalendarCollection>(file);
					var cal = (Models.Calendar)col.FirstOrDefault();
					if (cal != null) {
						var path = x.Substring(_Directory.Length);
						path = path.Substring(0, path.Length - 5);
						cal.Path = path.Trim('/', '\\');
					}
					return cal;
				}
			}).Where(x => x != null).AsQueryable();
		}

		public Calendar CreateCalendar(string path) {
			path = path.Trim('/').Split('/')[0];
			var filename = System.IO.Path.Combine(_Directory, path + ".ical");
			var ical = new Calendar();
			var serializer = new Models.Serializer();
			using (var file = System.IO.File.OpenWrite(filename))
				serializer.Serialize(file, ical);
			ical.Path = path;
			return ical;
		}

		public Calendar GetCalendarByPath(string path) {
			path = path.Trim('/').Split('/')[0];
			var filename = System.IO.Path.Combine(_Directory, path + ".ical");
			if (!System.IO.File.Exists(filename)) return null;
			var serializer = new Models.Serializer();

			using (var file = System.IO.File.OpenText(filename)) {
				var calendar = (serializer.Deserialize<CalendarCollection>(file))[0] as Models.Calendar;
				calendar.Path = path;
				return calendar;
			}
		}

		public Event GetEventByUID(string uid) {
			var filename = System.IO.Path.Combine(_Directory, uid + ".ics");
			if (!System.IO.File.Exists(filename)) return null;
			var serializer = new Models.Serializer();
			using (var file = System.IO.File.OpenText(filename)) {
				var calendar = (serializer.Deserialize<CalendarCollection>(file))[0] as Models.Calendar;
				return calendar.Events.FirstOrDefault();
			}
		}

		public void Save(Calendar calendar, Event e) {
			var filename = System.IO.Path.Combine(_Directory, e.UID + ".ics");
			calendar.Events.Add(e);
			var serializer = new Models. Serializer( );
			using(var file =  System.IO.File.OpenWrite(filename))
			serializer.Serialize(file, calendar);
		}
	}
}