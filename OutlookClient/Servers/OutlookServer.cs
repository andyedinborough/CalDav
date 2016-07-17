using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using CalDav.Client;
using CalCli.API;

namespace CalDav.Client.Servers {
    public class OutlookServer : IServer
    {
        public IConnection Connection
        {
            get
            {
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public Uri Url
        {
            get
            {
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public void CreateCalendar(ICalendar calendar)
        {
            throw new NotImplementedException();
        }

        public ICalendar[] GetCalendars()
        {
            throw new NotImplementedException();
        }
    }
}
