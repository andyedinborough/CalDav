
namespace CalDav {
	public class Alarm : ISerializeToICAL {
		public string Action { get; set; }
		public string Description { get; set; }
		public Trigger Trigger { get; set; }

		public void Deserialize(System.IO.TextReader rdr, Serializer serializer) {
			string name, value;
			var parameters = new System.Collections.Specialized.NameValueCollection();
			while (rdr.Property(out name, out value, parameters) && !string.IsNullOrEmpty(name)) {
				switch (name) {
					case "ACTION": Action = value; break;
					case "DESCRIPTION": Description = value; break;
					case "TRIGGER": Trigger = serializer.GetService<Trigger>(); Trigger.Deserialize(value, parameters); break;
				}
			}
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
