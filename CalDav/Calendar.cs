
using System.Collections.Generic;
namespace CalDav {
	public class Calendar : ISerializeToICAL {
		public Calendar() {
			Events = new List<Event>();
			TimeZones = new List<TimeZone>();
		}
		public virtual string Version { get; set; }
		public virtual ICollection<Event> Events { get; set; }
		public virtual ICollection<TimeZone> TimeZones { get; set; }

		public void Deserialize(System.IO.TextReader rdr) {
			string name, value;
			var parameters = new System.Collections.Specialized.NameValueCollection();
			while (rdr.Property(out name, out value, parameters) && !string.IsNullOrEmpty(name)) {
				switch (name.ToUpper()) {
					case "BEGIN":
						switch (value) {
							case "VEVENT":
								var e = new Event();
								e.Deserialize(rdr);
								Events.Add(e);
								break;
							case "VTIMEZONE":
								var tz = new TimeZone();
								tz.Deserialize(rdr);
								TimeZones.Add(tz);
								break;
						}
						break;
					case "END":
						if (value == "VCALENDAR")
							return;
						break;
				}
			}
		}

		public void Serialize(System.IO.TextWriter wrtr) {
			wrtr.BeginBlock("VACLENDAR");
			wrtr.Property("VERSION", Version ?? "2.0");
			wrtr.Property("PROGID", Common.PROGID);
			foreach (var e in Events)
				e.Serialize(wrtr);

			wrtr.EndBlock("VACLENDAR");
		}
	}
}
