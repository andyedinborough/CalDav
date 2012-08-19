using System.Collections.Generic;

namespace CalDav {
	public class CalendarCollection : List<Calendar>, ISerializeToICAL {

		public void Deserialize(System.IO.TextReader rdr) {
			string name, value;
			var parameters = new System.Collections.Specialized.NameValueCollection();
			while (rdr.Property(out name, out value, parameters) && !string.IsNullOrEmpty(name)) {
				switch (name.ToUpper()) {
					case "BEGIN":
						if (value == "VCALENDAR") {
							var e = new Calendar();
							e.Deserialize(rdr);
							this.Add(e);
						}
						break;
				}
			}
		}

		public void Serialize(System.IO.TextWriter wrtr) {
			foreach (var cal in this)
				cal.Serialize(wrtr);
		}
	}
}
