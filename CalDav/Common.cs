using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace CalDav {
	public static class Common {
		public const string PRODID = "-//tracky/iCal//FUBU v1.0//EN";
		public static readonly XNamespace xDav = XNamespace.Get("DAV:");
		public static readonly XNamespace xCalDav = XNamespace.Get("urn:ietf:params:xml:ns:caldav");
		public static readonly XNamespace xApple = XNamespace.Get("http://apple.com/ns/ical/");
		public static readonly XNamespace xCardDav = XNamespace.Get("urn:ietf:params:xml:ns:carddav");

		internal static void BeginBlock(this System.IO.TextWriter wrtr, string name) {
			wrtr.WriteLine("BEGIN:" + name.ToUpper());
		}
		internal static void EndBlock(this System.IO.TextWriter wrtr, string name) {
			wrtr.WriteLine("END:" + name.ToUpper());
		}
		internal static void Property(this System.IO.TextWriter wrtr, string name, IEnumerable<string> value) {
			wrtr.Property(name, string.Join(",", value.Select(PropertyEncode)), true);
		}

		public static bool Is(this string input, string other) {
			return string.Equals(input ?? string.Empty, other ?? string.Empty, StringComparison.OrdinalIgnoreCase);
		}

		private static Regex rxDate = new Regex(@"(\d{4})(\d{2})(\d{2})T?(\d{2}?)(\d{2}?)(\d{2}?)(Z?)", RegexOptions.IgnoreCase | RegexOptions.Compiled);
		public static DateTime? ToDateTime(this string value, Calendar calendar, string TimeZoneID) {
			var date = ToDateTime(value);
			if (date == null) return null;
			if (calendar == null) return date;
			var info = calendar.TimeZones.SelectMany(x => x).Where(x => x.ID == TimeZoneID);
			if (info == null) return date;
			throw new NotImplementedException();
		}

		public static T? ToEnum<T>(this string input) where T : struct, IConvertible {
			if (string.IsNullOrEmpty(input)) return null;
			T ret;
			if (System.Enum.TryParse<T>(input.Replace("-", "_"), true, out ret))
				return ret;
			return null;
		}

		public static DateTime? ToDateTime(this string value) {
			if (string.IsNullOrEmpty(value))
				return null;
			DateTime ret;
			var match = rxDate.Match(value);
			if (match.Success)
				return new DateTime(
					match.Groups[1].Value.ToInt() ?? 0,
					match.Groups[2].Value.ToInt() ?? 0,
					match.Groups[3].Value.ToInt() ?? 0,
					match.Groups[4].Value.ToInt() ?? 0,
					match.Groups[5].Value.ToInt() ?? 0,
					match.Groups[6].Value.ToInt() ?? 0,
				 match.Groups[match.Groups.Count - 1].Value.Is("Z") ? DateTimeKind.Utc : DateTimeKind.Unspecified);
			else if (DateTime.TryParse(value, out ret))
				return ret;

			return (DateTime?)null;
		}

		private static Regex rxOffset = new Regex(@"((\+|\-)?)(\d{1,2})\:?(\d{2})?", RegexOptions.Compiled);
		public static TimeSpan? ToOffset(this string input) {
			if (string.IsNullOrEmpty(input)) return null;
			var match = rxOffset.Match(input);
			if (!match.Success) return null;
			var neg = match.Groups[1].Value == "-";
			var hours = match.Groups[2].Value.ToInt() ?? 0;
			var minutes = match.Groups[3].Value.ToInt() ?? 0;
			var off = TimeSpan.FromHours(hours + ((double)minutes / 60));
			return neg ? -off : off;
		}

		public static Uri ToUri(this string input, Uri @base = null, UriKind kind = UriKind.Absolute) {
			Uri uri;
			if (@base != null) {
				if (Uri.TryCreate(@base, input, out uri))
					return uri;
			} else if (Uri.TryCreate(input, kind, out uri))
				return uri;
			return null;
		}

		public static int? ToInt(this string input) {
			int ret;
			if (int.TryParse(input, out ret))
				return ret;
			else return (int?)null;
		}

		private static string PropertyEncode(string value) {
			return value
				.Replace("\r", "\\r")
				.Replace("\\", "\\\\")
				.Replace("\n", "\\n")
				.Replace(";", "\\;")
				.Replace(",", "\\,")
				.Replace("\r", "");
		}
		private static string Decode(string value) {
			return value
				.Replace("\\n", "\n")
				.Replace("\\r", "\r")
				.Replace("\\\\", "\\")
				.Replace("\\;", ";")
				.Replace("\\,", ",");
		}
		internal static void Property(this System.IO.TextWriter wrtr, string name, string value, bool encoded = false, NameValueCollection parameters = null) {
			if (value == null) return;
			value = name.ToUpper() + FormatParameters(parameters) + ":" + (encoded ? value : PropertyEncode(value));
			while (value.Length > 75) {
				wrtr.WriteLine(value.Substring(0, 75));
				value = "\t" + value.Substring(75);
			}
			if (value.Length > 0) wrtr.WriteLine(value);
		}
		internal static void Property(this System.IO.TextWriter wrtr, string name, DateTime? value) {
			if (value == null
				|| value < System.Data.SqlTypes.SqlDateTime.MinValue.Value
				|| value > System.Data.SqlTypes.SqlDateTime.MaxValue.Value) return;
			wrtr.Property(name, FormatDate(value.Value));
		}

		internal static void Property(this System.IO.TextWriter wrtr, string name, Enum value) {
			if (value == null) return;
			wrtr.Property(name, value.ToString().ToUpper());
		}

		internal static void Property(this System.IO.TextWriter wrtr, string name, object value) {
			if (value == null) return;
			wrtr.Property(name,
				Convert.ToString(value),
				parameters: value is IHasParameters ? ((IHasParameters)value).GetParameters() : null);
		}

		internal static string FormatParameters(NameValueCollection parameters) {
			if (parameters == null || parameters.Count == 0) return string.Empty;

			var sb = new StringBuilder();
			foreach (var key in parameters.AllKeys) {
				sb.AppendFormat(";{0}={1}", key, ParamEncode(parameters[key]));
			}

			return sb.ToString();
		}

		internal static IEnumerable<string> SplitEscaped(this string input, char split = ',', char escape = '\\') {
			if (input == null)
				yield break;
			char c0 = '\0';
			string part = string.Empty;
			foreach (var c in input) {
				if (c == split && c0 != escape) {
					yield return part;
					part = string.Empty;
				} else part += c;
				c0 = c;
			}
		}

		internal static bool Property(this System.IO.TextReader rdr, out string name, out string value, NameValueCollection parameters) {
			var line = rdr.ReadLine();
			var oline = line;
			value = name = null;
			if (line == null)
				return false;
			int peek;
			while ((peek = rdr.Peek()) == 9 || peek == 32)
				line += rdr.ReadLine().Substring(1);

			if (parameters != null) parameters.Clear();

			var i = 0;
			var separators = new[] { ':', ';', '=' };
			string part, paramValue;
			char sep;

			while (line.Length > 0) {
				i = line.IndexOfAny(separators);
				if (i == -1) {
					value = line;
					return true;
				}
				sep = line[i];
				part = line.Substring(0, i);
				line = line.Substring(i + 1);

				if (name == null) {
					name = part;

				} else if (sep == ':') {
					value = line;
					return true;

				} else if (sep == '=') {
					if (line.Length > 1 && line[0] == '"') {
						paramValue = line.Substring(1, line.IndexOf('"', 1) - 1);
						line = line.Substring(paramValue.Length + 2);
						if (line.Length > 0 && line[0] == ';') line = line.Substring(1);

					} else {
						i = line.IndexOfAny(separators);
						if (i == -1) i = line.Length;
						paramValue = line.Substring(0, i);
						line = line.Substring((int)Math.Min(line.Length, paramValue.Length + 1));
					}

					paramValue = paramValue.Replace("=3D", "=").Replace("\\;", ";");
					parameters[part] = paramValue;
				}
			}
			return true;
		}

		internal static string ParamEncode(string value) {
			if (value == null) return null;
			if (value.Contains('=') || value.Contains(';'))
				return '"' + value.Replace("=", "=3D") + '"';
			return value;
		}

		public static string FormatDate(this DateTime? dateTime) {
			if (dateTime == null) return null;
			return FormatDate(dateTime.Value);
		}
		public static string FormatDate(this DateTime dateTime) {
			return dateTime.ToString("yyyyMMddTHHmmss") + (dateTime.Kind == DateTimeKind.Utc ? "Z" : "");
		}

		internal static string FormatOffset(this TimeSpan offset) {
			var neg = offset < TimeSpan.Zero;
			var minutes = (int)offset.TotalMinutes;
			var hours = (int)Math.Floor((double)minutes / 60);
			minutes -= hours * 60;

			return (neg ? "-" : null) + hours.ToString("00") + minutes.ToString("00");
		}

		public static XElement Element(this XNamespace ns, string name, params object[] inner) {
			return new XElement(ns.GetName(name), inner);
		}

		public static XElement Element(this XName name, params object[] inner) {
			return new XElement(name, inner);
		}
	}
}
