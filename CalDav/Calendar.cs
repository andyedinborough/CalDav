
using System.Collections.Generic;
namespace CalDav {
	public class Calendar : ISerializeToICAL {
		public Calendar() {
			Events = new List<Event>();
			TimeZones = new List<TimeZone>();
		}
		public virtual string Version { get; set; }
		public virtual string ProdID { get; set; }
		public virtual ICollection<Event> Events { get; set; }
		public virtual ICollection<TimeZone> TimeZones { get; set; }

		public string Scale { get; set; }

		public void Deserialize(System.IO.TextReader rdr, Serializer serializer) {
			string name, value;
			var parameters = new System.Collections.Specialized.NameValueCollection();
			while (rdr.Property(out name, out value, parameters) && !string.IsNullOrEmpty(name)) {
				switch (name.ToUpper()) {
					case "BEGIN":
						switch (value) {
							case "VEVENT":
								var e = serializer.GetService<Event>();
								e.Calendar = this;
								Events.Add(e);
								e.Deserialize(rdr, serializer);
								break;
							case "VTIMEZONE":
								var tz = serializer.GetService<TimeZone>();
								tz.Calendar = this;
								TimeZones.Add(tz);
								tz.Deserialize(rdr, serializer);
								break;
						}
						break;
					case "CALSCALE": Scale = value; break;
					case "VERSION": Version = value; break;
					case "PRODID": ProdID = value; break;
					case "END":
						if (value == "VCALENDAR")
							return;
						break;
				}
			}
		}

		public void Serialize(System.IO.TextWriter wrtr) {
			wrtr.BeginBlock("VCALENDAR");
			wrtr.Property("VERSION", Version ?? "2.0");
			wrtr.Property("PRODID", Common.PRODID);
			wrtr.Property("CALSCALE", Scale);
			foreach (var e in Events)
				e.Serialize(wrtr);

			wrtr.EndBlock("VCALENDAR", false);
		}
	}
}
