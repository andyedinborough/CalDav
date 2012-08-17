
using System.Collections.Generic;
namespace CalDav {
	public class Calendar : ISerializeToICAL {
		public Calendar() {
			Events = new List<Event>();
		}
		public virtual string Version { get; set; }
		public virtual ICollection<Event> Events { get; set; }

		public void Deserialize(System.IO.TextReader rdr) {

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
