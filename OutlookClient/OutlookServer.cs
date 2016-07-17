using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using CalCli.API;
using Outlook = Microsoft.Office.Interop.Outlook;

namespace OutlookClient {
    public class OutlookServer : IServer
    {
        Outlook.Application application = new Outlook.Application();
        public IConnection Connection
        {
            get
            {
                return null;
            }

            set
            {

            }
        }

        public Uri Url
        {
            get
            {
                return null;
            }

            set
            {

            }
        }

        public void CreateCalendar(ICalendar calendar)
        {
            throw new Exception("Outlook doesn't support creating calendars.");
        }

        public ICalendar[] GetCalendars()
        {
            return new ICalendar[] { new OutlookCalendar(application) };
        }
    }
}
