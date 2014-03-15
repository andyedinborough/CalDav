using System.Collections.Generic;
using System.Linq;

namespace CalDav.Server
{
    public interface ICalendarRepository
    {
        IEnumerable<ICalendarInfo> GetCalendars();
        ICalendarInfo GetCalendarByID(string id);
        ICalendarInfo CreateCalendar(string id);
        void Save(ICalendarInfo calendar, ICalendarObject e);

        ICalendarObject GetObjectByUID(ICalendarInfo calendar, string uid);
        IQueryable<ICalendarObject> GetObjectsByFilter(ICalendarInfo calendar, Filter filter);
        IQueryable<ICalendarObject> GetObjects(ICalendarInfo calendar);

        void DeleteObject(ICalendarInfo calendar, string uid);
    }
}
