using System;
using System.Collections.Generic;
using System.Linq;
using CalCli.API;
using CalDav;
using Outlook = Microsoft.Office.Interop.Outlook;

namespace OutlookClient {
    public class OutlookEvent : IEvent
    {
        Outlook.Application application;
        Outlook.AppointmentItem appointment;
        public OutlookEvent(Outlook.Application app)
        {
            application = app;
            appointment = app.CreateItem(Microsoft.Office.Interop.Outlook.OlItemType.olAppointmentItem);
        }
        public ICollection<IAlarm> Alarms
        {
            get
            {
                return new List<IAlarm> {
                    new OutlookAlarm()
                    {
                        Action = AlarmActions.DISPLAY,
                        Trigger = new Trigger()
                        {
                            DateTime = appointment.Start.AddMinutes(-appointment.ReminderMinutesBeforeStart)
                        }

                    }
                };
            }

            set
            {
                if (Alarms.Count > 1)
                    throw new Exception("Outlook doesn't support multiple alarms.");
                else
                {
                    if (Alarms.Count == 0)
                        appointment.ReminderSet = false;
                    else
                    {
                        appointment.ReminderSet = true;
                        if(value.First().Trigger.DateTime != null)
                        {
                            value.First().Trigger.Duration = value.First().Trigger.DateTime - appointment.Start;
                        }
                        appointment.ReminderMinutesBeforeStart = (int)value.First().Trigger.Duration.Value.TotalMinutes;
                    }
                }
            }
        }

        public ICollection<string> Categories
        {
            get
            {
                return new List<string> { appointment.Categories };
            }

            set
            {
                appointment.Categories = "";
                foreach (string category in value)
                {
                    appointment.Categories += value + ";";
                }
               
            }
        }

        public DateTime? Created
        {
            get
            {
                return appointment.CreationTime;
            }

            set
            {
                throw new Exception("Creation time is read only using outlook. It is automatically set. ");
            }
        }

        public string Description
        {
            get
            {
                return appointment.Body;
            }

            set
            {
                appointment.Body = value;
            }
        }

        public DateTime? End
        {
            get
            {
                return appointment.End;
            }

            set
            {
                if (value == null)
                    throw new Exception("End cannot be null.");
                appointment.End = (DateTime)value;
            }
        }

        public DateTime? Start
        {
            get
            {
                return appointment.Start;
            }

            set
            {
                if(value == null)
                    throw new Exception("Start cannot be null.");
                appointment.Start = (DateTime)value;
            
            }
        }

        public string Summary
        {
            get
            {
                return appointment.Subject;
            }

            set
            {
                appointment.Subject = value;
            }
        }

        public string UID
        {
            get; set;
        }

        public Uri Url
        {
            get
            {
                throw new Exception("Url doesn't make sence for outlook calendar.");
            }

            set
            {
                throw new Exception("Url doesn't make sence for outlook calendar.");
            }
        }
    }
}
