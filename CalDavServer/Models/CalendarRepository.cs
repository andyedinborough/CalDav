using DDay.iCal;
using System.Linq;
using System.Security.Principal;

namespace CalDav.Server.Models {
	public interface ICalendarRepository {
		IQueryable<IICalendar> List();
		IICalendar GetCalendarByName(string name);
		IICalendar CreateCalendar(string name);
		IEvent GetEventByUID(string uid);
		void Save(IICalendar calendar, IEvent e);
	}

	public class CalendarRepository : ICalendarRepository {
		private string _Directory;

		public CalendarRepository(IPrincipal user) {
			_Directory = System.IO.Path.Combine(System.Web.HttpRuntime.AppDomainAppPath, "App_Data\\Calendars");
			System.IO.Directory.CreateDirectory(_Directory);
		}

		public IQueryable<IICalendar> List() {
			var files = System.IO.Directory.GetFiles(_Directory, "*.ical");
			return files.Select(x => (IICalendar)DDay.iCal.iCalendar.LoadFromFile(x)).AsQueryable();
		}

		public IICalendar CreateCalendar(string name) {
			var filename = System.IO.Path.Combine(_Directory, name + ".ical");
			var ical = new DDay.iCal.iCalendar { Name = name };
			var serializer = new DDay.iCal.Serialization.iCalendar.iCalendarSerializer(ical);
			serializer.Serialize(ical, filename);
			return ical;
		}

		public IICalendar GetCalendarByName(string name) {
			var filename = System.IO.Path.Combine(_Directory, name + ".ical");
			if (!System.IO.File.Exists(filename)) return null;
			return (IICalendar)DDay.iCal.iCalendar.LoadFromFile(filename);
		}

		public IEvent GetEventByUID(string uid) {
			var filename = System.IO.Path.Combine(_Directory, uid + ".ics");
			if (!System.IO.File.Exists(filename)) return null;
			using (var file = System.IO.File.OpenText(filename))
				return (IEvent)DDay.iCal.Event.LoadFromStream(file);
		}

		public void Save(IICalendar calendar, IEvent e) {
			var filename = System.IO.Path.Combine(_Directory, e.UID + ".ics");
			calendar.Events.Add(e);
			var serializer = new DDay.iCal.Serialization.iCalendar.iCalendarSerializer(calendar);
			serializer.Serialize(calendar, filename);
		}
	}
}