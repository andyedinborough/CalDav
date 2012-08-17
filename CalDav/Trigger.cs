using System;
using System.Collections.Specialized;

namespace CalDav {
	public class Trigger : IHasParameters {
		public enum Relateds {
			Start, End
		}
		public Relateds Related { get; set; }
		public TimeSpan? Duration { get; set; }
		public DateTime? DateTime { get; set; }

		public NameValueCollection GetParameters() {
			var values = new NameValueCollection();
			if (DateTime != null) values["VALUE"] = "DATE-TIME";
			if (DateTime == null || Related != Relateds.Start)
				values["RELATED"] = Related.ToString().ToUpper();
			return values;
		}

		public override string ToString() {
			if (DateTime != null) return Common.FormatDate(DateTime.Value);
			if (Duration != null) return
				 (Duration.Value < TimeSpan.Zero ? "-" : null)
				 + "P" + Duration.Value.TotalMinutes + "M";
			return null;
		}

		public void Deserialize(string value, System.Collections.Specialized.NameValueCollection parameters) {
			throw new NotImplementedException();
		}
	}
}
