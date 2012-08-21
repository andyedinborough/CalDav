using System;
using System.Collections.Generic;
using System.Linq;

namespace CalDav {
	public class Calendar : ISerializeToICAL {
		public Calendar() {
			Events = new List<Event>();
			TimeZones = new List<TimeZone>();
			ToDos = new List<ToDo>();
			JournalEntries = new List<JournalEntry>();
			FreeBusy = new List<FreeBusy>();
		}
		public virtual string Version { get; set; }
		public virtual string ProdID { get; set; }
		public virtual ICollection<Event> Events { get; set; }
		public virtual ICollection<ToDo> ToDos { get; set; }
		public virtual ICollection<TimeZone> TimeZones { get; set; }
		public virtual ICollection<JournalEntry> JournalEntries { get; set; }
		public virtual ICollection<FreeBusy> FreeBusy { get; set; }

		public virtual IQueryable<ICalendarObject> Items {
			get {
				return Events.OfType<ICalendarObject>()
					.Union(ToDos).Union(JournalEntries).Union(FreeBusy)
					.AsQueryable();
			}
		}

		public virtual void AddItem(ICalendarObject obj) {
			if (obj == null) return;
			else if (obj is Event) Events.Add((Event)obj);
			else if (obj is ToDo) ToDos.Add((ToDo)obj);
			else if (obj is JournalEntry) JournalEntries.Add((JournalEntry)obj);
			else if (obj is FreeBusy) FreeBusy.Add((FreeBusy)obj);
			else throw new InvalidCastException();
		}

		public string Scale { get; set; }

		public virtual void Deserialize(System.IO.TextReader rdr, Serializer serializer) {
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
							case "VTODO":
								var td = serializer.GetService<ToDo>();
								td.Calendar = this;
								ToDos.Add(td);
								td.Deserialize(rdr, serializer);
								break;
							case "VFREEBUSY":
								var fb = serializer.GetService<FreeBusy>();
								fb.Calendar = this;
								FreeBusy.Add(fb);
								fb.Deserialize(rdr, serializer);
								break;
							case "VJOURNAL":
								var jn = serializer.GetService<JournalEntry>();
								jn.Calendar = this;
								JournalEntries.Add(jn);
								jn.Deserialize(rdr, serializer);
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

		public virtual void Serialize(System.IO.TextWriter wrtr) {
			wrtr.BeginBlock("VCALENDAR");
			wrtr.Property("VERSION", Version ?? "2.0");
			wrtr.Property("PRODID", Common.PRODID);
			wrtr.Property("CALSCALE", Scale);
			foreach (var tz in TimeZones) {
				tz.Calendar = this;
				tz.Serialize(wrtr);
			}
			foreach (var e in Events) {
				e.Calendar = this;
				e.Serialize(wrtr);
			}
			foreach (var td in ToDos) {
				td.Calendar = this;
				td.Serialize(wrtr);
			}
			foreach (var fb in FreeBusy) {
				fb.Calendar = this;
				fb.Serialize(wrtr);
			}
			foreach (var jn in JournalEntries) {
				jn.Calendar = this;
				jn.Serialize(wrtr);
			}

			wrtr.EndBlock("VCALENDAR");
		}
	}
}
