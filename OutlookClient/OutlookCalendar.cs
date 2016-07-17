using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Xml.Linq;
using CalCli.API;
using Outlook = Microsoft.Office.Interop.Outlook;
using OutlookClient;

namespace OutlookClient {
    public class OutlookCalendar : ICalendar
    {
        public string Description
        {
            get
            {
                return "Outlook calendar.";
            }

            set
            {
                throw new Exception("Description for outlook calendar is readonly. ");
            }
        }

        public string Name
        {
            get
            {
                return "Outlook calendar.";
            }

            set
            {
                throw new Exception("Name for outlook calendar is readonly. ");
            }
        }

        public IAlarm createAlarm()
        {
            return new OutlookAlarm();
        }

        public IToDo createToDo()
        {
            throw new NotImplementedException();
        }

        public ITrigger createTrigger()
        {
            throw new NotImplementedException();
        }

        public void Save(IToDo t)
        {
            throw new NotImplementedException();
        }

        public void Save(IEvent e)
        {
            throw new NotImplementedException();
        }
    }
}
