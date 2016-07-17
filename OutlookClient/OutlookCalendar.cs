using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Xml.Linq;
using CalCli.API;
using Outlook = Microsoft.Office.Interop.Outlook;
using OutlookClient;
using System.Runtime.InteropServices;

namespace OutlookClient {
    public class OutlookCalendar : ICalendar
    {
        private Outlook.Application application;
        public OutlookCalendar(Outlook.Application app)
        {
            this.application = app;
        }
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
            return new OutlookAlarm(application);
        }

        public IEvent createEvent()
        {
            return new OutlookEvent(application);
        }

        public IToDo createToDo()
        {
            return new OutlookToDo(application);
        }

        public ITrigger createTrigger()
        {
            return new CalDav.Trigger();
        }

        public void Save(IToDo t)
        {
            Outlook.TaskItem item = ((OutlookToDo)t).TaskItem;
            item.Assign();
            item.Save();
            sync();
        }

        public void Save(IEvent e)
        {
            Outlook.AppointmentItem item = ((OutlookEvent)e).Appointment;
            item.Save();
            sync();
        }

        private void sync()
        {

            Outlook.NameSpace ns = application.GetNamespace("MAPI");
            ns.SendAndReceive(false);
            if (ns != null) Marshal.ReleaseComObject(ns);
        }
    }
}
