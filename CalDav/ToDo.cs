using System;
using System.Collections.Generic;
using System.Linq;

namespace CalDav {
	public class ToDo : ICalendarObject {
		public ToDo() {
			Categories = new List<string>();
			Properties = new List<Tuple<string, string, System.Collections.Specialized.NameValueCollection>>();
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
		public Calendar Calendar { get; set; }
		public virtual int? Sequence { get; set; }
		public virtual DateTime? LastModified { get; set; }
		public virtual DateTime? Completed { get; set; }
		public ICollection<Tuple<string, string, System.Collections.Specialized.NameValueCollection>> Properties { get; set; }

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
					case "LAST-MODIFIED": LastModified = value.ToDateTime(); break;
					case "COMPLETED": Completed = value.ToDateTime(); break;
					case "SEQUENCE": Sequence = value.ToInt(); break;
					case "END": return;
					default:
						Properties.Add(Tuple.Create(name, value, parameters));
						break;
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
			wrtr.Property("SEQUENCE", Sequence);
			wrtr.Property("LAST-MODIFIED", LastModified);

			if (Properties != null)
				foreach (var prop in Properties)
					wrtr.Property(prop.Item1, prop.Item2, parameters: prop.Item3);

			wrtr.EndBlock("VTODO");
		}

	}
}
