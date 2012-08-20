using System;
using System.Collections.Generic;
using System.Linq;

namespace CalDav {
	public class ToDo : ISerializeToICAL {
		public ToDo() {
			Categories = new List<string>();
		}

		public virtual string UID { get; set; }
		internal DateTime? DTSTAMP;
		public virtual DateTime? Start { get; set; }
		public virtual DateTime? Due { get; set; }
		public virtual string Summary { get; set; }
		public virtual Classes? Class { get; set; }
		public virtual ICollection<string> Categories { get; set; }
		public virtual int? Priority { get; set; }
		public virtual Statuses? Status { get; set; }

		public void Deserialize(System.IO.TextReader rdr, Serializer serializer) {
			string name, value;
			var parameters = new System.Collections.Specialized.NameValueCollection();
			while (rdr.Property(out name, out value, parameters) && !string.IsNullOrEmpty(name)) {
				switch (name.ToUpper()) {
					case "UID": UID = value; break;
					case "DTSTAMP": DTSTAMP = value.ToDateTime(); break;
					case "DTSTART": Start = value.ToDateTime(); break;
					case "DUE": Due = value.ToDateTime(); break;
					case "SUMMARY": Summary = value; break;
					case "CLASS": Class = value.ToEnum<Classes>(); break;
					case "CATEGORIES": Categories = value.SplitEscaped().ToList(); break;
					case "PRIORITY": Priority = value.ToInt(); break;
					case "STATUS": Status = value.ToEnum<Statuses>(); break;
				}
			}
		}

		public void Serialize(System.IO.TextWriter wrtr) {
			wrtr.BeginBlock("VTODO");
			wrtr.Property("UID", UID);
			wrtr.Property("DTSTAMP", DTSTAMP);
			wrtr.Property("DTSTART", Start);
			wrtr.Property("DUE", Due);
			wrtr.Property("SUMMARY", Summary);
			wrtr.Property("CLASS", Class);
			wrtr.Property("CATEGORIES", Categories);
			wrtr.Property("PRIORITY", Priority);
			wrtr.Property("STATUS", Status);

			wrtr.BeginBlock("VTODO");
		}
	}
}
