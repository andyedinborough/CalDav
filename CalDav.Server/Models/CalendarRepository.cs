using System;
using System.Linq;
using System.Security.Principal;

namespace CalDav.Server.Models {
	public interface ICalendarRepository {
		IQueryable<Calendar> List();
		Calendar GetCalendarByPath(string path);
		Calendar CreateCalendar(string path);
		void Save(Calendar calendar, ICalendarObject e);
		DateTime GetLastModifiedDate(Calendar Calendar);

		ICalendarObject GetObjectByUID(Calendar calendar, string uid);
		IQueryable<ICalendarObject> GetObjectsByFilter(Filter filter);
		ICalendarObject GetObjectByPath(string href);
	}

	public class CalendarRepository : ICalendarRepository {
		private string _Directory;

		public CalendarRepository(IPrincipal user) {
			_Directory = System.IO.Path.Combine(System.Web.HttpRuntime.AppDomainAppPath, "App_Data\\Calendars");
			System.IO.Directory.CreateDirectory(_Directory);
		}

		public DateTime GetLastModifiedDate(Calendar calendar) {
			var directory = System.IO.Path.Combine(_Directory, calendar.Path);
			var files = System.IO.Directory.GetFiles(directory, "*.ics");
			if (files.Length == 0) return DateTime.MinValue;
			return files.Select(x => System.IO.File.GetLastAccessTimeUtc(x)).Max();
		}

		public IQueryable<Calendar> List() {
			var files = System.IO.Directory.GetDirectories(_Directory, "*.ical", System.IO.SearchOption.AllDirectories);
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
			var filename = System.IO.Path.Combine(_Directory, path + "\\_.ical");
			var ical = new Calendar();
			var serializer = new Models.Serializer();
			System.IO.Directory.CreateDirectory(System.IO.Path.Combine(_Directory, path));
			using (var file = System.IO.File.OpenWrite(filename))
				serializer.Serialize(file, ical);
			ical.Path = path;
			return ical;
		}

		public Calendar GetCalendarByPath(string path) {
			path = path.Trim('/').Split('/')[0];
			var filename = System.IO.Path.Combine(_Directory, path + "\\_.ical");
			if (!System.IO.File.Exists(filename)) return null;
			var serializer = new Models.Serializer();

			using (var file = System.IO.File.OpenText(filename)) {
				var calendar = (serializer.Deserialize<CalendarCollection>(file))[0] as Models.Calendar;
				calendar.Path = path;
				return calendar;
			}
		}

		public ICalendarObject GetObjectByUID(Calendar calendar, string uid) {
			var filename = System.IO.Path.Combine(_Directory, calendar.Path, uid + ".ics");
			if (!System.IO.File.Exists(filename)) return null;
			var serializer = new Models.Serializer();
			using (var file = System.IO.File.OpenText(filename)) {
				var ical = (serializer.Deserialize<CalendarCollection>(file))[0] as Models.Calendar;
				return ical.Events.OfType<ICalendarObject>()
					.Union(ical.ToDos)
					.Union(ical.FreeBusy)
					.Union(ical.JournalEntries)
					.FirstOrDefault();
			}
		}

		public void Save(Calendar calendar, ICalendarObject e) {
			var filename = System.IO.Path.Combine(_Directory, calendar.Path, e.UID + ".ics");
			calendar.AddItem(e);
			var serializer = new Models.Serializer();
			using (var file = System.IO.File.OpenWrite(filename))
				serializer.Serialize(file, calendar);
		}


		public IQueryable<ICalendarObject> GetObjectsByFilter(Filter filter) {
			return null;
		}

		public ICalendarObject GetObjectByPath(string path) {
			var calendar = GetCalendarByPath(path);
			var uid = path.Split('/').Last().Split('.').FirstOrDefault();
			return GetObjectByUID(calendar, uid);
		}
	}
}