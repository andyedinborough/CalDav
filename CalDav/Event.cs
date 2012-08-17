using System;
using System.Collections.Generic;

namespace CalDav {
	public class Event : ISerializeToICAL {
		private DateTime DTSTAMP = DateTime.UtcNow;

		public virtual ICollection<Contact> Attendees { get; set; }
		public virtual ICollection<string> Categories { get; set; }
		public virtual string Class { get; set; }
		public virtual DateTime? Created { get; set; }
		public virtual ICollection<string> Contacts { get; set; }
		public virtual string Description { get; set; }
		public virtual bool IsAllDay { get; set; }
		public virtual DateTime? LastModified { get; set; }
		public virtual DateTime? Start { get; set; }
		public virtual DateTime? End { get; set; }
		public virtual string Location { get; set; }
		public virtual int? Priority { get; set; }
		public virtual string Status { get; set; }
		public virtual int? Sequence { get; set; }
		public virtual string Summary { get; set; }
		public virtual string Transparency { get; set; }
		public virtual string UID { get; set; }
		public virtual Uri Url { get; set; }
		public virtual Contact Organizer { get; set; }

		public void Deserialize(System.IO.TextReader rdr) {
			throw new NotImplementedException();
		}

		public void Serialize(System.IO.TextWriter wrtr) {
			var d = new DDay.iCal.Event();
			wrtr.BeginBlock("VEVENT");
			if (Attendees != null)
				foreach (var attendee in Attendees)
					wrtr.Property("ATTENDEE", attendee);
			if (Categories != null && Categories.Count > 0)
				wrtr.Property("CATEGORIES", string.Join(",", Categories));
			wrtr.Property("UID", UID);
			wrtr.Property("DTSTAMP", DTSTAMP);
			wrtr.Property("DTSTART", Start);
			wrtr.Property("DTEND", End);
			wrtr.Property("SUMMARY", Summary);



			wrtr.EndBlock("VEVENT");
		}
	}
}
