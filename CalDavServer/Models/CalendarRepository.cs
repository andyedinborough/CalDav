using DDay.iCal;
using System.Linq;
using System.Security.Principal;

namespace CalDav.Server.Models {
	public interface ICalendarRepository {
		IQueryable<Calendar> List();
		Calendar GetCalendarByPath(string path);
		Calendar CreateCalendar(string path);
		IEvent GetEventByUID(string uid);
		void Save(Calendar calendar, IEvent e);
	}

	public class CalendarRepository : ICalendarRepository {
		private string _Directory;

		public CalendarRepository(IPrincipal user) {
			_Directory = System.IO.Path.Combine(System.Web.HttpRuntime.AppDomainAppPath, "App_Data\\Calendars");
			System.IO.Directory.CreateDirectory(_Directory);
		}

		private class Service : DDay.iCal.Serialization.SerializationContext {
			public override object GetService(System.Type serviceType) {
				if (serviceType == typeof(DDay.iCal.Serialization.ISerializationSettings))
					return new DDay.iCal.Serialization.SerializationSettings { iCalendarType = typeof(Calendar) };

				return base.GetService(serviceType);
			}
		}

		public IQueryable<Calendar> List() {
			var files = System.IO.Directory.GetFiles(_Directory, "*.ical");
			var serializer = new DDay.iCal.Serialization.iCalendar.iCalendarSerializer(new Service());
			return files.Select(x => {
				using (var file = System.IO.File.OpenText(x)) {
					var cal = ((iCalendarCollection)serializer.Deserialize(file)).OfType<Calendar>().FirstOrDefault();
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
			var serializer = new DDay.iCal.Serialization.iCalendar.iCalendarSerializer(new Service());
			serializer.Serialize(ical, filename);
			ical.Path = path;
			return ical;
		}

		public Calendar GetCalendarByPath(string path) {
			path = path.Trim('/').Split('/')[0];
			var filename = System.IO.Path.Combine(_Directory, path + ".ical");
			if (!System.IO.File.Exists(filename)) return null;
			var serializer = new DDay.iCal.Serialization.iCalendar.iCalendarSerializer(new Service());

			using (var file = System.IO.File.OpenText(filename)) {
				var calendar = ((iCalendarCollection)serializer.Deserialize(file))[0] as Calendar;
				calendar.Path = path;
				return calendar;
			}
		}

		public IEvent GetEventByUID(string uid) {
			var filename = System.IO.Path.Combine(_Directory, uid + ".ics");
			if (!System.IO.File.Exists(filename)) return null;
			using (var file = System.IO.File.OpenText(filename))
				return (IEvent)DDay.iCal.Event.LoadFromStream(file);
		}

		public void Save(Calendar calendar, IEvent e) {
			var filename = System.IO.Path.Combine(_Directory, e.UID + ".ics");
			calendar.Events.Add(e);
			var serializer = new DDay.iCal.Serialization.iCalendar.iCalendarSerializer(new Service());
			serializer.Serialize(calendar, filename);
		}
	}
}