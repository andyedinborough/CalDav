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
			if (DateTime == null && Related != Relateds.Start)
				values["RELATED"] = Related.ToString().ToUpper();
			return values;
		}

		public override string ToString() {
			if (DateTime != null) return Common.FormatDate(DateTime.Value);
			if (Duration != null) {
				var total = Math.Abs(Duration.Value.TotalSeconds);
				var weeks = Math.Floor(total / 3600 / 24 / 7);
				total -= weeks * 3600 * 24 * 7;
				var days = Math.Floor(total / 3600 / 24);
				total -= days * 3600 * 24;
				var hours = Math.Floor(total / 3600);
				total -= hours * 3600;
				var minutes = Math.Floor(total / 60);
				var seconds = (total -= minutes * 60);

				return (Duration.Value < TimeSpan.Zero ? "-" : null)
					+ "P"
					+ (weeks > 0 ? (weeks + "W") : null)
					+ (days > 0 ? (days + "D") : null)
					+ (weeks > 0 || days > 0 ? "T" : null)
					+ (hours > 0 ? (hours + "H") : null)
					+ (minutes > 0 ? (minutes + "M") : null)
					+ (seconds > 0 ? (seconds + "S") : null);
			}
			return null;
		}

		public void Deserialize(string value, System.Collections.Specialized.NameValueCollection parameters) {
			if (string.Equals(parameters["VALUE"], "DATE-TIME", StringComparison.OrdinalIgnoreCase)) {
				DateTime = value.ToDateTime();
			} else {
				Relateds related;
				if (System.Enum.TryParse<Relateds>(parameters["RELATED"], true, out related))
					Related = related;

				var duration = TimeSpan.Zero;
				var neg = false;
				var num = "";
				foreach (var c in value.ToUpper()) {
					if (char.IsDigit(c)) {
						num += c;
					} else {
						switch (c) {
							case '-': neg = true; continue;
							case 'W': duration = duration.Add(TimeSpan.FromDays((num.ToInt() ?? 0) * 7)); break;
							case 'D': duration = duration.Add(TimeSpan.FromDays(num.ToInt() ?? 0)); break;
							case 'H': duration = duration.Add(TimeSpan.FromHours(num.ToInt() ?? 0)); break;
							case 'M': duration = duration.Add(TimeSpan.FromMinutes(num.ToInt() ?? 0)); break;
							case 'S': duration = duration.Add(TimeSpan.FromSeconds(num.ToInt() ?? 0)); break;
						}
						num = string.Empty;
					}
				}

				Duration = neg ? -duration : duration;
			}
		}
	}
}
