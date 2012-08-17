using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
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
			wrtr.Property(name, string.Join(",", value.Select(Encode)), true);
		}
		private static string Encode(string value) {
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
		internal static void Property(this System.IO.TextWriter wrtr, string name, string value, bool encoded = false, string parameters = null) {
			if (value == null) return;

			value = name.ToUpper() + parameters + ":" + (encoded ? value : Encode(value));
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
				parameters: value is IHasParameters ? ((IHasParameters)value).GetParameterString() : null);
		}

		internal static void Property(this System.IO.TextReader rdr, out string name, out string value, NameValueCollection parameters) {
			var line = rdr.ReadLine();
			int peek;
			while ((peek = rdr.Peek()) == 9 || peek == 32)
				line += rdr.ReadLine().Substring(1);

			if (parameters != null) parameters.Clear();

			value = name = null;
			var colon = line.IndexOf(':');
			if (colon == -1) return;

			name = line.Substring(0, colon);
			value = line.Substring(colon + 1);

			var semicolon = name.IndexOf(';');
			if (semicolon == -1) return;
			var ps = name.Substring(semicolon + 1);
			name = name.Substring(0, semicolon);

			while (ps.Length > 0) {
				var eq = ps.IndexOf('=');
				semicolon = ps.IndexOf(';');
				if (semicolon == -1) semicolon = ps.Length;
				parameters[ps.Substring(0, eq)] = ps.Substring(eq + 1, semicolon - eq - 1);
				if (semicolon >= ps.Length) break;
				ps = ps.Substring(semicolon + 1);
			}
		}

		internal static string ParamEncode(string Name) {
			return Uri.EscapeDataString(Name);
		}

		internal static string FormatDate(DateTime dateTime) {
			return dateTime.ToString("yyyyMMddTHHmmss") + (dateTime.Kind == DateTimeKind.Utc ? "Z" : "");
		}
	}
}
