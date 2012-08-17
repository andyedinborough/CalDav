using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalDav {
	public class Alarm : ISerializeToICAL {
		public string Action { get; set; }
		public string Description { get; set; }
		public Trigger Trigger {get;set;}

		public void Deserialize(System.IO.TextReader rdr) {
			throw new NotImplementedException();
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
