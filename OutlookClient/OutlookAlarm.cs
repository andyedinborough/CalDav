using System;
using CalCli.API;
using Outlook = Microsoft.Office.Interop.Outlook;
using CalDav;
namespace OutlookClient {
    public class OutlookAlarm : IAlarm
    {
        public OutlookAlarm(Outlook.Application application)
        {
            this.application = application;
        }

        Outlook.Reminder reminder;
        public AlarmActions Action
        {
            get
            {
                return AlarmActions.DISPLAY;
            }

            set
            {
                if(value != AlarmActions.DISPLAY)
                    throw new Exception("Outlook supports display type only.");
            }
        }

        public string Description
        {
            get
            {
                return reminder.Caption;
            }

            set
            {
                throw new Exception("Description cannot be set for Outlook alarm.");
            }
        }

        private Trigger trigger;
        private Outlook.Application application;

        public ITrigger Trigger
        {
            get
            {
                if (trigger == null)
                    return new Trigger()
                    {
                        DateTime = reminder.OriginalReminderDate
                    };
                else
                    return trigger;
            }

            set
            {
                trigger = (Trigger)value;
            }
        }
    }
}
