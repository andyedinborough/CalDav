using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CalDav {
	public class Trigger : IHasParameters {
		public enum Relateds {
			Start, End
		}
		public Relateds Related { get; set; }
		public TimeSpan? Duration { get; set; }
		public DateTime? DateTime { get; set; }

		public string GetParameterString() {
			return
				(DateTime == null ? null : (";VALUE=DATE-TIME" ))
				+ (DateTime != null || Related == Relateds.Start ? null : (";RELATED=END"))
				;
		}

		public override string ToString() {
			if (DateTime != null) return Common.FormatDate(DateTime.Value);
			if (Duration != null) return
				 (Duration.Value < TimeSpan.Zero ? "-" : null)
				 + "P" + Duration.Value.TotalMinutes + "M";
			return null;
		}
	}
}
