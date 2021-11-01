using System;

namespace CalCli.API
{
    public interface IServer
    {
        Uri Url { get; set; }
        IConnection Connection { get; set; }
        ICalendar[] GetCalendars();
        void CreateCalendar(ICalendar calendar);
    }
}
