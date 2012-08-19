using System;
using System.Collections.Generic;

namespace CalDav {
	public class TimeZone : List<TimeZone.TimeZoneDetail>, ISerializeToICAL {
		public class TimeZoneDetail : ISerializeToICAL {
			public TimeZoneDetail() {
				Recurrences = new List<Recurrence>();
			}
			public string Type { get; set; }
			public string Name { get; set; }
			public DateTime? Start { get; set; }
			public TimeSpan? OffsetFrom { get; set; }
			public TimeSpan? OffsetTo { get; set; }
			public ICollection<Recurrence> Recurrences { get; set; }

			public void Deserialize(System.IO.TextReader rdr, Serializer serializer) {
				string name, value;
				var parameters = new System.Collections.Specialized.NameValueCollection();
				while (rdr.Property(out name, out value, parameters) && !string.IsNullOrEmpty(name)) {
					switch (name.ToUpper()) {
						case "TZNAME": Name = value; break;
						case "DTSTART": Start = value.ToDateTime(); break;
						case "RRULE":
							var rule =  serializer.GetService< Recurrence>();
							rule.Deserialize(value, parameters);
							Recurrences.Add(rule);
							break;
						case "TZOFFSETFROM": OffsetFrom = value.ToOffset(); break;
						case "TZOFFSETTO": OffsetTo = value.ToOffset(); break;
						case "END": return;
					}
				}
			}

			public void Serialize(System.IO.TextWriter wrtr) {
				wrtr.BeginBlock(Type.ToUpper());
				if (!string.IsNullOrEmpty(Name)) wrtr.Property("TZNAME", Name);
				if (Start != null) wrtr.Property("DTSTART", Start);
				if (Recurrences != null)
					foreach (var rule in Recurrences)
						wrtr.Property("RRULE", rule);
				if (OffsetFrom != null)
					wrtr.Property("TZOFFSETFROM", OffsetFrom.Value.FormatOffset());
				if (OffsetFrom != null)
					wrtr.Property("TZOFFSETTO", OffsetTo.Value.FormatOffset());
				wrtr.EndBlock(Type.ToUpper());
			}
		}

		public void Deserialize(System.IO.TextReader rdr, Serializer serializer) {
			string name, value;
			var parameters = new System.Collections.Specialized.NameValueCollection();
			while (rdr.Property(out name, out value, parameters) && !string.IsNullOrEmpty(name)) {
				switch (name) {
					case "BEGIN":
						var detail =  serializer.GetService< TimeZoneDetail >();
						detail.Type = value;
						detail.Deserialize(rdr, serializer);
						Add(detail);
						break;
					case "END":
						if (value == "VTIMEZONE")
							return;
						break;
				}
			}

		}

		public void Serialize(System.IO.TextWriter wrtr) {
			if (Count == 0) return;
			wrtr.BeginBlock("VTIMEZONE");
			foreach (var detail in this) {
				detail.Serialize(wrtr);
			}
			wrtr.EndBlock("VTIMEZONE");
		}
	}
}
