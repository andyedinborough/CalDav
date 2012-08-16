using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace CalDavServer {
	public class Filter {
		private static readonly XNamespace xDAV = XNamespace.Get("DAV");
		private static readonly XNamespace xCaldav = XNamespace.Get("urn:ietf:params:xml:ns:caldav");

		public CompFilter[] Filters { get; set; }

		public Filter() { }
		public Filter(XElement filter) {
			var filters = new List<CompFilter>();
			foreach (var elm in filter.Elements()) {
				var obj = Create(elm);
				if (obj == null) continue;
				if (obj is CompFilter)
					filters.Add((CompFilter)obj);
			}
			Filters = filters.ToArray();
		}

		internal static DateTime ParseDate(string value) {
			var match = Regex.Match(value, @"(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z");
			if (match.Success)
				return new DateTime(
					int.Parse(match.Groups[1].Value),
					int.Parse(match.Groups[2].Value),
					int.Parse(match.Groups[3].Value),
					int.Parse(match.Groups[4].Value),
					int.Parse(match.Groups[5].Value),
					int.Parse(match.Groups[6].Value), DateTimeKind.Utc);
			return DateTime.Parse(value);
		}

		private static object Create(XElement elm) {
			switch (elm.Name.LocalName.ToLower()) {
				case "filter":
					return new Filter(elm);
				case "comp-filter":
					return new CompFilter(elm);
				case "time-range":
					return new TimeRangeFilter(elm);
				case "prop-filter":
					return new ValueFilter(elm);
			}
			return null;
		}

		public class CompFilter {
			public string Name { get; set; }
			public CompFilter[] Filters { get; set; }
			public ValueFilter[] Properties { get; set; }
			public TimeRangeFilter TimeRange { get; set; }
			public bool? IsDefined { get; set; }

			public CompFilter(XElement filter) {
				Name = (string)filter.Attribute("name");
				var props = new List<ValueFilter>();
				var filters = new List<CompFilter>();
				foreach (var elm in filter.Elements()) {
					switch (elm.Name.LocalName) {
						case "is-defined":
							IsDefined = true;
							continue;
					}
					var obj = Create(elm);
					if (obj == null) continue;
					if (obj is ValueFilter)
						props.Add((ValueFilter)obj);
					if (obj is TimeRangeFilter)
						TimeRange = (TimeRangeFilter)obj;
					if (obj is CompFilter)
						filters.Add((CompFilter)obj);
				}
				Properties = props.ToArray();
				Filters = filters.ToArray();
			}
		}

		public class ValueFilter {
			public ValueFilter(XElement filter) {
				Name = (string)filter.Attribute("name");
				var paramfilters = new List<ValueFilter>();
				foreach (var elm in filter.Elements()) {
					switch (elm.Name.LocalName) {
						case "text-match":
							Text = elm.Value;
							IgnoreCase = (string)elm.Attribute("caseless") == "yes";
							break;
						case "param-filter":
							paramfilters.Add(new ValueFilter(elm));
							break;
					}
					Parameters = paramfilters.ToArray();
				}
			}
			public string Name { get; set; }
			public bool? IgnoreCase { get; set; }
			public string Text { get; set; }
			public ValueFilter[] Parameters { get; set; }
		}

		public class TimeRangeFilter {
			public TimeRangeFilter(XElement elm) {
				var attr = elm.Attribute("start");
				if (attr != null) Start = ParseDate((string)attr);

				attr = elm.Attribute("end");
				if (attr != null) End = ParseDate((string)attr);
			}
			public DateTime? Start { get; set; }
			public DateTime? End { get; set; }
		}
	}
}