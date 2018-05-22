using System;
using CalCli.API;
namespace CalDav {
	public class Alarm : ISerializeToICAL, IAlarm {
		public AlarmActions Action { get; set; }
		public string Description { get; set; }
        public Trigger CalDavTrigger { get; set; }

        public ITrigger Trigger
        {
            get
            {
                return CalDavTrigger;
            }
        }

        ITrigger IAlarm.Trigger
        {
            get
            {
                return CalDavTrigger;
            }

            set
            {
                CalDavTrigger = (CalDav.Trigger)value;
            }
        }

        public void Deserialize(System.IO.TextReader rdr, Serializer serializer) {
			string name, value;
			var parameters = new System.Collections.Specialized.NameValueCollection();
			while (rdr.Property(out name, out value, parameters) && !string.IsNullOrEmpty(name)) {
				switch (name) {
					case "ACTION": Action = getAlarmActions(value); break;
					case "DESCRIPTION": Description = value; break;
					case "TRIGGER": CalDavTrigger = serializer.GetService<Trigger>(); CalDavTrigger.Deserialize(value, parameters); break;
                    case "END": return;
                }
            }
        }

        private AlarmActions getAlarmActions(string value)
        {
            switch(value)
            {
                case "EMAIL":
                    return AlarmActions.EMAIL;
                case "AUDIO":
                    return AlarmActions.AUDIO;
                case "DISPLAY":
                    return AlarmActions.DISPLAY;
                case "NONE":
                    return AlarmActions.NONE;
                default:
                    throw new Exception("Action is not valid for alarm.");
            }
        }

        public void Serialize(System.IO.TextWriter wrtr) {
			wrtr.BeginBlock("VALARM");
			wrtr.Property("ACTION", Action);
			wrtr.Property("DESCRIPTION", Description);
            wrtr.Property("TRIGGER", Trigger);
			wrtr.EndBlock("VALARM");
		}
	}
}
