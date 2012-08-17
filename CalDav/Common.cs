using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Xml.Linq;

namespace CalDav {
	public static class Common {
		public const string PROGID = "-//tracky/CalDav//FUBU v1.0//EN";
		public static readonly XNamespace xDAV = XNamespace.Get("DAV");
		public static readonly XNamespace xCaldav = XNamespace.Get("urn:ietf:params:xml:ns:caldav");

		internal static void BeginBlock(this System.IO.TextWriter wrtr, string name) {
			wrtr.WriteLine("BEGIN:" + name);
		}
		internal static void EndBlock(this System.IO.TextWriter wrtr, string name) {
			wrtr.WriteLine("End:" + name);
		}
		internal static void Property(this System.IO.TextWriter wrtr, string name, IEnumerable<string> value) {
			wrtr.Property(name, string.Join(",", value.Select(PropertyEncode)), true);
		}
		private static string PropertyEncode(string value) {
			return value
				.Replace("\n", "\\n")
				.Replace("\r", "\\r")
				.Replace("\\", "\\\\")
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
				wrtr.Write(value.Substring(0, 75));
				value = "\t" + value.Substring(75);
			}
		}
		internal static void Property(this System.IO.TextWriter wrtr, string name, DateTime? value) {
			if (value == null
				|| value < System.Data.SqlTypes.SqlDateTime.MinValue.Value
				|| value > System.Data.SqlTypes.SqlDateTime.MaxValue.Value) return;
			wrtr.Property(name, FormatDate(value.Value));
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

		internal static void Property(this System.IO.TextReader rdr, out string name, out string value, NameValueCollection parameters) {
			var line = rdr.ReadLine();
			int peek;
			while ((peek = rdr.Peek()) == 9 || peek == 32)
				line += rdr.ReadLine().Substring(1);

			if (parameters != null) parameters.Clear();

			value = name = null;
			var i = 0;
			var separators = new[] { ':', ';', '=' };
			string part, paramValue;
			char sep;

			while (line.Length > 0) {
				i = line.IndexOfAny(separators);
				if (i == -1) {
					value = line;
					return;
				}
				sep = line[i];
				part = line.Substring(0, i);
				line = line.Substring(i + 1);

				if (name == null) {
					name = part;

				} else if (sep == ':') {
					value = line;
					return;

				} else if (sep == '=') {
					if (line.Length > 1 && line[0] == '"') {
						paramValue = line.Substring(1, line.IndexOf('"', 1) - 1);
						line = line.Substring(paramValue.Length + 2);
						if (line.Length > 0 && line[0] == ';') line = line.Substring(1);

					} else {
						paramValue = line.Substring(0, line.IndexOfAny(separators));
						line = line.Substring(paramValue.Length + 1);
					}

					paramValue = paramValue.Replace("=3D", "=").Replace("\\;", ";");
					parameters[part] = paramValue;
				}
			}
		}

		internal static string ParamEncode(string value) {
			if (value == null) return null;
			if (value.Contains('=') || value.Contains(';'))
				return '"' + value.Replace("=", "=3D") + '"';
			return value;
		}

		internal static string FormatDate(DateTime dateTime) {
			return dateTime.ToString("yyyyMMddTHHmmss") + (dateTime.Kind == DateTimeKind.Utc ? "Z" : "");
		}
	}
}
